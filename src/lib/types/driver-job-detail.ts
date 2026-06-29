import type { JobStatus } from '$lib/types/job';

export type DriverJobProgressStageState = 'complete' | 'current' | 'upcoming';

export type DriverJobProgressStage = {
	id: string;
	label: string;
	subtitle: string;
	state: DriverJobProgressStageState;
	timestamp: string | null;
	tone?: 'danger';
	reason_tag?: string | null;
};

export type DriverJobDetailAction = {
	kind: 'start' | 'complete' | 'report_issue' | 'get_directions';
	hint?: string;
	label: string;
	href?: string;
};

export type DriverJobDetailPageData = {
	id: string;
	reference: string;
	status: JobStatus;
	pickup_address: string;
	dropoff_address: string;
	scheduled_date_label: string;
	scheduled_time_label: string;
	vehicle_label: string | null;
	notes: string | null;
	directions_address: string;
	progress_stages: DriverJobProgressStage[];
	primary_action: DriverJobDetailAction | null;
	secondary_actions: DriverJobDetailAction[];
	completion_banner: {
		time_label: string;
	} | null;
	attempted_banner: {
		reason: string;
	} | null;
};
