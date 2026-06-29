export type JobStatus = 'pending' | 'in_progress' | 'complete' | 'attempted';

export type JobSummary = {
	id: string;
	reference: string;
	status: JobStatus | string;
	pickup_address: string;
	dropoff_address: string;
	scheduled_at: string;
	assigned_driver_id: string | null;
};
