import type { JobStatus } from '$lib/types/job';

export type OperatorJobTimelineEventState = 'complete' | 'active' | 'failed' | 'pending';

export type OperatorJobTimelineEvent = {
	id: string;
	label: string;
	timestamp: string | null;
	state: OperatorJobTimelineEventState;
	/** Shown below failed events, e.g. "No answer". */
	reason?: string;
	/** Shown on the right for active steps instead of a timestamp. */
	statusLabel?: string;
};

export type OperatorJobPodAwaiting = { status: 'awaiting' };

export type OperatorJobPodSubmitted = {
	status: 'submitted';
	completed_by: string;
	timestamp: string;
	blockchain_ref: string;
};

export type OperatorJobPod = OperatorJobPodAwaiting | OperatorJobPodSubmitted;

export type OperatorJobCostData = {
	fuel_cost: number;
	job_value: number;
	margin: number;
	margin_percent: number;
};

export type OperatorJobDetailPageData = {
	id: string;
	reference: string;
	status: JobStatus | string;
	created_at: string;
	pickup_address: string;
	dropoff_address: string;
	scheduled_at: string;
	driver_name: string;
	driver_status: string;
	notes: string;
	timeline: OperatorJobTimelineEvent[];
	pod: OperatorJobPod;
	/** Null on free plan — shows locked upsell card (Figma 6E). */
	cost: OperatorJobCostData | null;
	/** False on free plan — greys out Generate Invoice (Figma 6E). */
	invoice_enabled: boolean;
};
