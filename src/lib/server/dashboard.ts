import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { DashboardJobRow, DashboardPageData } from '$lib/types/dashboard';
import type { UserProfile } from '$lib/types/user';
import { isMissingColumn } from '$lib/server/profile';
import { listJobsForUser } from '$lib/server/jobs';
import { countActiveCompanyDrivers } from '$lib/server/users';

type AppSupabase = SupabaseClient<Database>;

function startOfDay(date: Date) {
	const copy = new Date(date);
	copy.setHours(0, 0, 0, 0);
	return copy;
}

function formatJobReference(reference: string) {
	return reference.startsWith('#') ? reference : `#${reference}`;
}

function toDashboardJobRow(
	job: Database['public']['Tables']['jobs']['Row'],
	driverNames: Map<string, string>
): DashboardJobRow {
	return {
		id: job.id,
		reference: formatJobReference(job.reference),
		pickup_address: job.pickup_address,
		dropoff_address: job.dropoff_address,
		driver_name: job.assigned_driver_id
			? (driverNames.get(job.assigned_driver_id) ?? null)
			: null,
		status: job.status,
		scheduled_at: job.scheduled_at
	};
}

export async function loadDashboardData(
	supabase: AppSupabase,
	profile: UserProfile
): Promise<DashboardPageData> {
	const jobs = await listJobsForUser(supabase, profile);
	const today = startOfDay(new Date());

	const stats = {
		pending: jobs.filter((job) => job.status === 'pending').length,
		inProgress: jobs.filter((job) => job.status === 'in_progress').length,
		completedToday: jobs.filter((job) => {
			if (job.status !== 'complete' || !job.completed_at) return false;
			return startOfDay(new Date(job.completed_at)).getTime() === today.getTime();
		}).length
	};

	const driverIds = [
		...new Set(jobs.map((job) => job.assigned_driver_id).filter((id): id is string => !!id))
	];

	const driverNames = new Map<string, string>();
	if (driverIds.length > 0) {
		const { data: drivers, error } = await supabase
			.from('users')
			.select('id, full_name')
			.in('id', driverIds);

		if (error) throw error;

		for (const driver of drivers ?? []) {
			driverNames.set(driver.id, driver.full_name);
		}
	}

	const recentJobs = [...jobs]
		.sort(
			(a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
		)
		.slice(0, 5)
		.map((job) => toDashboardJobRow(job, driverNames));

	const { data: company, error: companyError } = await supabase
		.from('companies')
		.select('verification_status')
		.eq('id', profile.company_id)
		.maybeSingle();

	let showPendingVerificationBanner = false;

	if (!companyError && company) {
		showPendingVerificationBanner = company.verification_status === 'pending';
	} else if (companyError && !isMissingColumn(companyError, 'verification_status')) {
		throw companyError;
	}

	const driverCount = await countActiveCompanyDrivers(supabase, profile.company_id);

	return {
		stats,
		recentJobs,
		showPendingVerificationBanner,
		showOnboardingBanner: !showPendingVerificationBanner && driverCount === 0
	};
}
