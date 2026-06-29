import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type {
	DriverActivityItem,
	DriverJobTabCounts,
	DriverProfileData,
	DriverProfileJobRow,
	DriverProfileJobStatus
} from '$lib/types/drivers';
import type { UserProfile } from '$lib/types/user';
import { formatDriverLastActive } from '$lib/utils/drivers';
import { buildDriverActivateUrl } from '$lib/utils/driver-invite';
import { getDriverForCompany } from '$lib/server/users';

type AppSupabase = SupabaseClient<Database>;
type DriverRow = Database['public']['Tables']['users']['Row'];
type JobRow = Database['public']['Tables']['jobs']['Row'];
type HistoryRow = Database['public']['Tables']['job_status_history']['Row'];

const PROFILE_JOB_PAGE_SIZE = 10;

function startOfMonth(date: Date) {
	const copy = new Date(date);
	copy.setDate(1);
	copy.setHours(0, 0, 0, 0);
	return copy;
}

function startOfDay(date: Date) {
	const copy = new Date(date);
	copy.setHours(0, 0, 0, 0);
	return copy;
}

function formatJobReference(reference: string) {
	return reference.startsWith('#') ? reference : `#${reference}`;
}

function toProfileJobStatus(status: string): DriverProfileJobStatus | null {
	if (
		status === 'pending' ||
		status === 'in_progress' ||
		status === 'complete' ||
		status === 'attempted'
	) {
		return status;
	}
	return null;
}

function formatProfileJobDate(scheduledAt: string): string {
	const date = new Date(scheduledAt);
	const today = startOfDay(new Date());
	const target = startOfDay(date);

	if (target.getTime() === today.getTime()) {
		return 'Today';
	}

	return date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short'
	});
}

function formatActivityTimestamp(value: string): string {
	const date = new Date(value);
	const today = startOfDay(new Date());
	const target = startOfDay(date);
	const time = date.toLocaleTimeString('en-GB', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});

	if (target.getTime() === today.getTime()) {
		return `Today at ${time.toLowerCase()}`;
	}

	if (today.getTime() - target.getTime() === 24 * 60 * 60 * 1000) {
		return `Yesterday at ${time.toLowerCase()}`;
	}

	return `${date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	})} at ${time.toLowerCase()}`;
}

function countJobStatuses(jobs: JobRow[]): DriverJobTabCounts {
	const counts: DriverJobTabCounts = {
		all: jobs.length,
		pending: 0,
		in_progress: 0,
		complete: 0,
		attempted: 0
	};

	for (const job of jobs) {
		const status = toProfileJobStatus(job.status);
		if (status) {
			counts[status]++;
		}
	}

	return counts;
}

function mapJobToProfileRow(job: JobRow): DriverProfileJobRow | null {
	const status = toProfileJobStatus(job.status);
	if (!status) return null;

	return {
		id: job.id,
		reference: formatJobReference(job.reference),
		pickup_address: job.pickup_address,
		dropoff_address: job.dropoff_address,
		status,
		date_label: formatProfileJobDate(job.scheduled_at),
		show_view_action: true
	};
}

function historyToActivity(
	entry: HistoryRow,
	referenceByJobId: Map<string, string>
): DriverActivityItem | null {
	const reference = formatJobReference(referenceByJobId.get(entry.job_id) ?? '');

	if (entry.new_status === 'complete') {
		return {
			id: entry.id,
			kind: 'complete',
			title: `Completed job ${reference}`,
			timestamp_label: formatActivityTimestamp(entry.created_at)
		};
	}

	if (entry.new_status === 'in_progress') {
		return {
			id: entry.id,
			kind: 'started',
			title: `Started job ${reference}`,
			timestamp_label: formatActivityTimestamp(entry.created_at)
		};
	}

	if (entry.new_status === 'attempted') {
		const note = entry.note?.trim();
		return {
			id: entry.id,
			kind: 'attempted',
			title: note
				? `Attempted delivery on ${reference} — ${note}`
				: `Attempted delivery on ${reference}`,
			timestamp_label: formatActivityTimestamp(entry.created_at)
		};
	}

	return null;
}

async function fetchDriverActivity(
	supabase: AppSupabase,
	companyId: string,
	driver: DriverRow,
	jobs: JobRow[]
): Promise<DriverActivityItem[]> {
	const referenceByJobId = new Map(jobs.map((job) => [job.id, job.reference]));
	const jobIds = jobs.map((job) => job.id);
	const activity: DriverActivityItem[] = [];

	if (driver.status === 'pending') {
		activity.push({
			id: `invite-${driver.id}`,
			kind: 'invite',
			title: 'Invite sent via SMS',
			timestamp_label: formatActivityTimestamp(driver.created_at)
		});
	}

	if (jobIds.length > 0) {
		const { data: history, error } = await supabase
			.from('job_status_history')
			.select('*')
			.eq('company_id', companyId)
			.in('job_id', jobIds)
			.order('created_at', { ascending: false })
			.limit(10);

		if (error) throw error;

		for (const entry of history ?? []) {
			const item = historyToActivity(entry, referenceByJobId);
			if (item) {
				activity.push(item);
			}
		}
	}

	if (driver.status === 'active' && !activity.some((item) => item.kind === 'activated')) {
		activity.push({
			id: `activated-${driver.id}`,
			kind: 'activated',
			title: 'Account activated',
			timestamp_label: formatActivityTimestamp(driver.created_at)
		});
	}

	return activity.slice(0, 10);
}

/** Operator driver profile — real DB data for /drivers/[id]. */
export async function fetchDriverProfileData(
	supabase: AppSupabase,
	profile: UserProfile,
	driverId: string,
	plan: 'free' | 'pro',
	activateBaseUrl: string
): Promise<DriverProfileData | null> {
	const driver = await getDriverForCompany(supabase, profile, driverId);
	if (!driver) return null;

	const { data: jobs, error: jobsError } = await supabase
		.from('jobs')
		.select('*')
		.eq('company_id', profile.company_id)
		.eq('assigned_driver_id', driverId)
		.order('scheduled_at', { ascending: false });

	if (jobsError) throw jobsError;

	const allJobs = jobs ?? [];
	const monthStart = startOfMonth(new Date()).toISOString();
	const jobsThisMonth = allJobs.filter((job) => job.scheduled_at >= monthStart).length;
	const rows = allJobs
		.map(mapJobToProfileRow)
		.filter((row): row is DriverProfileJobRow => row !== null)
		.slice(0, PROFILE_JOB_PAGE_SIZE);
	const activity = await fetchDriverActivity(supabase, profile.company_id, driver, allJobs);
	const inviteLink =
		driver.status === 'pending' && driver.invite_token
			? buildDriverActivateUrl(activateBaseUrl, driver.invite_token)
			: null;

	return {
		plan,
		invite_link: inviteLink,
		driver: {
			id: driver.id,
			full_name: driver.full_name,
			phone: driver.phone ?? '',
			status: driver.status === 'active' ? 'active' : 'pending',
			added_at: driver.created_at,
			jobs_this_month: jobsThisMonth,
			last_active: formatDriverLastActive(driver.last_active_at)
		},
		jobs: {
			counts: countJobStatuses(allJobs),
			rows,
			pagination: {
				from: rows.length > 0 ? 1 : 0,
				to: rows.length,
				total: allJobs.length
			}
		},
		activity
	};
}
