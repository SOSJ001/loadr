import type { Database } from '$lib/types/database';
import type {
	DriverJobDatePill,
	DriverJobDayStats,
	DriverJobListItem,
	DriverJobTimePeriod,
	DriverJobsPageData
} from '$lib/types/driver-jobs';
import type { JobStatus } from '$lib/types/job';

type JobRow = Database['public']['Tables']['jobs']['Row'];

export function driverTimeGreeting(date = new Date()): string {
	const hour = date.getHours();
	if (hour < 12) return 'Good morning';
	if (hour < 17) return 'Good afternoon';
	return 'Good evening';
}

export function driverFirstName(fullName: string): string {
	return fullName.trim().split(/\s+/)[0] || fullName;
}

export function toDateKey(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function parseDateKey(value: string): Date {
	const [year, month, day] = value.split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function formatSelectedDateLabel(date: Date): string {
	return date.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	});
}

export function formatJobTime(scheduledAt: string): string {
	return new Date(scheduledAt).toLocaleTimeString('en-GB', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
}

export function jobTimePeriod(scheduledAt: string): DriverJobTimePeriod {
	return new Date(scheduledAt).getHours() < 12 ? 'morning' : 'afternoon';
}

export function formatDatePillLabel(date: Date): string {
	return date.toLocaleDateString('en-GB', {
		weekday: 'short',
		day: 'numeric'
	});
}

export function startOfWeekSunday(date: Date): Date {
	const result = new Date(date);
	const day = result.getDay();
	result.setDate(result.getDate() - day);
	result.setHours(0, 0, 0, 0);
	return result;
}

export function buildDatePills(
	selectedDate: string,
	jobsByDate: Map<string, JobRow[]>
): DriverJobDatePill[] {
	const anchor = parseDateKey(selectedDate);
	const weekStart = startOfWeekSunday(anchor);

	return Array.from({ length: 7 }, (_, index) => {
		const date = new Date(weekStart);
		date.setDate(weekStart.getDate() + index);
		const key = toDateKey(date);

		return {
			date: key,
			label: formatDatePillLabel(date),
			job_count: jobsByDate.get(key)?.length ?? 0
		};
	});
}

export function destinationLabelFromAddress(address: string): string {
	const parts = address.split(',').map((part) => part.trim());
	return parts[parts.length - 1] || address;
}

function mapJobRow(job: JobRow, vehicleLabel?: string): DriverJobListItem {
	return {
		id: job.id,
		reference: job.reference,
		status: job.status as JobStatus,
		pickup_address: job.pickup_address,
		dropoff_address: job.dropoff_address,
		scheduled_at: job.scheduled_at,
		vehicle_label: vehicleLabel,
		has_notes: Boolean(job.notes?.trim()),
		time_period: jobTimePeriod(job.scheduled_at)
	};
}

function countStats(jobs: JobRow[]): DriverJobDayStats {
	return jobs.reduce<DriverJobDayStats>(
		(stats, job) => {
			if (job.status === 'pending' || job.status === 'attempted') stats.pending += 1;
			if (job.status === 'in_progress') stats.in_progress += 1;
			if (job.status === 'complete') stats.complete += 1;
			return stats;
		},
		{ pending: 0, in_progress: 0, complete: 0 }
	);
}

export function buildDriverJobsPageData(
	jobs: JobRow[],
	driverFullName: string,
	selectedDate = toDateKey(new Date()),
	vehicleLabelsById: Record<string, string> = {}
): DriverJobsPageData {
	const jobsByDate = new Map<string, JobRow[]>();

	for (const job of jobs) {
		const key = toDateKey(new Date(job.scheduled_at));
		const bucket = jobsByDate.get(key) ?? [];
		bucket.push(job);
		jobsByDate.set(key, bucket);
	}

	const dayJobs = (jobsByDate.get(selectedDate) ?? []).sort(
		(a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
	);

	const listJobs = dayJobs.map((job) =>
		mapJobRow(
			job,
			job.assigned_vehicle_id ? vehicleLabelsById[job.assigned_vehicle_id] : undefined
		)
	);
	const activeSource =
		dayJobs.find((job) => job.status === 'in_progress') ??
		jobs.find((job) => job.status === 'in_progress');

	const activeJob = activeSource
		? {
				id: activeSource.id,
				reference: activeSource.reference,
				destination_label: destinationLabelFromAddress(activeSource.dropoff_address)
			}
		: null;

	const bannerJobId = activeJob?.id;
	const visibleJobs = listJobs
		.filter((job) => job.id !== bannerJobId)
		.map((job) => ({
			...job,
			show_complete_action: job.status === 'in_progress' && !activeJob
		}));

	return {
		greeting: driverTimeGreeting(),
		driver_first_name: driverFirstName(driverFullName),
		selected_date: selectedDate,
		selected_date_label: formatSelectedDateLabel(parseDateKey(selectedDate)),
		date_pills: buildDatePills(selectedDate, jobsByDate),
		stats: countStats(dayJobs),
		active_job: activeJob,
		morning_jobs: visibleJobs.filter((job) => job.time_period === 'morning'),
		afternoon_jobs: visibleJobs.filter((job) => job.time_period === 'afternoon')
	};
}
