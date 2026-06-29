export type OperatorJobStats = {
	pending: number;
	inProgress: number;
	complete: number;
	attempted: number;
};

export type OperatorJobListRow = {
	id: string;
	reference: string;
	pickup_address: string;
	dropoff_address: string;
	pickup_line1?: string;
	pickup_line2?: string;
	dropoff_line1?: string;
	dropoff_line2?: string;
	driver_id: string | null;
	driver_name: string | null;
	status: string;
	scheduled_at: string;
};

export type OperatorJobDriverOption = {
	id: string;
	full_name: string;
};

export type OperatorJobsPageData = {
	jobs: OperatorJobListRow[];
	stats: OperatorJobStats;
	drivers: OperatorJobDriverOption[];
	/** Total jobs in the company (for pagination when `jobs` is one page). */
	totalJobs?: number;
};
