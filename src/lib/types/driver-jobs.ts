import type { JobStatus } from '$lib/types/job';

export type DriverJobTimePeriod = 'morning' | 'afternoon';

export type DriverJobListItem = {
	id: string;
	reference: string;
	status: JobStatus;
	pickup_address: string;
	dropoff_address: string;
	scheduled_at: string;
	vehicle_label?: string;
	has_notes?: boolean;
	show_complete_action?: boolean;
	time_period: DriverJobTimePeriod;
};

export type DriverJobDatePill = {
	date: string;
	label: string;
	job_count: number;
};

export type DriverJobDayStats = {
	pending: number;
	in_progress: number;
	complete: number;
};

export type DriverJobActiveBanner = {
	id: string;
	reference: string;
	destination_label: string;
};

export type DriverJobsPageData = {
	greeting: string;
	driver_first_name: string;
	selected_date: string;
	selected_date_label: string;
	date_pills: DriverJobDatePill[];
	stats: DriverJobDayStats;
	active_job: DriverJobActiveBanner | null;
	morning_jobs: DriverJobListItem[];
	afternoon_jobs: DriverJobListItem[];
	has_unread_notifications?: boolean;
};
