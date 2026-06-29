import type { JobStatus } from '$lib/types/job';

export type DashboardStats = {
	pending: number;
	inProgress: number;
	completedToday: number;
};

export type DashboardJobRow = {
	id: string;
	reference: string;
	pickup_address: string;
	dropoff_address: string;
	driver_name: string | null;
	status: JobStatus | string;
	scheduled_at: string;
};

export type DashboardPageData = {
	stats: DashboardStats;
	recentJobs: DashboardJobRow[];
	showOnboardingBanner: boolean;
	showPendingVerificationBanner: boolean;
	hoverPreviewJobId?: string | null;
};
