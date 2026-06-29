import { isMockJobAttempted, isMockJobInProgress } from '$lib/data/mock-operator-jobs';
import type { OperatorJobDetailPageData } from '$lib/types/operator-job-detail';

const SHARED_JOB_COST = {
	fuel_cost: 18.5,
	job_value: 95,
	margin: 76.5,
	margin_percent: 80.5
} as const;

const SHARED_JOB_FIELDS = {
	pickup_address: '14 Bold Street, Liverpool, L1 4AF',
	dropoff_address: '88 Park Street, Bath, BA1 2AE',
	scheduled_at: '2026-06-09T09:30:00.000Z',
	driver_name: 'James Okafor',
	driver_status: 'Active',
	notes: 'Fragile, leave at reception'
} as const;

/** Figma 6A — Job Detail (Complete), #0042. */
function getMockOperatorJobDetailComplete(
	jobId: string,
	reference: string
): OperatorJobDetailPageData {
	return {
		id: jobId,
		reference,
		status: 'complete',
		created_at: '2026-06-09T08:47:00.000Z',
		...SHARED_JOB_FIELDS,
		timeline: [
			{
				id: 'created',
				label: 'Job created',
				timestamp: '2026-06-09T08:47:00.000Z',
				state: 'complete'
			},
			{
				id: 'started',
				label: 'Job started',
				timestamp: '2026-06-09T09:14:00.000Z',
				state: 'complete'
			},
			{
				id: 'completed',
				label: 'Delivery completed',
				timestamp: '2026-06-09T11:42:00.000Z',
				state: 'complete'
			},
			{
				id: 'invoice',
				label: 'Invoice generated',
				timestamp: null,
				state: 'pending'
			}
		],
		pod: {
			status: 'submitted',
			completed_by: 'James Okafor',
			timestamp: '2026-06-09T11:42:00.000Z',
			blockchain_ref: 'a3f9...c72b'
		},
		cost: { ...SHARED_JOB_COST },
		invoice_enabled: true
	};
}

/** Figma 6C — Job Detail (Attempted), #0042. */
function getMockOperatorJobDetailAttempted(
	jobId: string,
	reference: string
): OperatorJobDetailPageData {
	return {
		id: jobId,
		reference,
		status: 'complete',
		created_at: '2026-06-09T08:47:00.000Z',
		...SHARED_JOB_FIELDS,
		timeline: [
			{
				id: 'created',
				label: 'Job created',
				timestamp: '2026-06-09T08:47:00.000Z',
				state: 'complete'
			},
			{
				id: 'started',
				label: 'Job started',
				timestamp: '2026-06-09T09:14:00.000Z',
				state: 'complete'
			},
			{
				id: 'attempted',
				label: 'Delivery attempted',
				timestamp: '2026-06-09T11:42:00.000Z',
				state: 'failed',
				reason: 'No answer'
			},
			{
				id: 'invoice',
				label: 'Invoice generated',
				timestamp: null,
				state: 'pending'
			}
		],
		pod: { status: 'awaiting' },
		cost: { ...SHARED_JOB_COST },
		invoice_enabled: true
	};
}

/** Figma 6D — Job Detail (In Progress), #0042. */
function getMockOperatorJobDetailInProgress(
	jobId: string,
	reference: string
): OperatorJobDetailPageData {
	return {
		id: jobId,
		reference,
		status: 'in_progress',
		created_at: '2026-06-09T08:47:00.000Z',
		...SHARED_JOB_FIELDS,
		timeline: [
			{
				id: 'created',
				label: 'Job created',
				timestamp: '2026-06-09T08:47:00.000Z',
				state: 'complete'
			},
			{
				id: 'started',
				label: 'Job started',
				timestamp: null,
				state: 'active',
				statusLabel: 'In progress...'
			},
			{
				id: 'completed',
				label: 'Delivery completed',
				timestamp: null,
				state: 'pending'
			},
			{
				id: 'invoice',
				label: 'Invoice generated',
				timestamp: null,
				state: 'pending'
			}
		],
		pod: { status: 'awaiting' },
		cost: { ...SHARED_JOB_COST },
		invoice_enabled: true
	};
}

function referenceFromMockId(jobId: string): string {
	const num = jobId.replace(/^mock-/, '');
	return `#${num.padStart(4, '0')}`;
}

export type OperatorJobDetailVariant = 'complete' | 'attempted' | 'in_progress';

export function getMockOperatorJobDetail(
	jobId = 'mock-0042',
	variant: OperatorJobDetailVariant = 'complete'
): OperatorJobDetailPageData {
	const reference = referenceFromMockId(jobId);

	if (variant === 'attempted') {
		return getMockOperatorJobDetailAttempted(jobId, reference);
	}

	if (variant === 'in_progress') {
		return getMockOperatorJobDetailInProgress(jobId, reference);
	}

	return getMockOperatorJobDetailComplete(jobId, reference);
}

export function resolveMockOperatorJobDetailVariant(
	jobId: string,
	preview: string | null
): OperatorJobDetailVariant {
	if (preview === 'attempted') return 'attempted';
	if (preview === 'in_progress') return 'in_progress';
	if (isMockJobAttempted(jobId)) return 'attempted';
	if (isMockJobInProgress(jobId)) return 'in_progress';
	return 'complete';
}

/** Figma 6E — Job Detail (Free Tier): locks cost tracking and invoicing. */
export function applyJobDetailPlanFeatures(
	pageData: OperatorJobDetailPageData,
	plan: string,
	preview: string | null
): OperatorJobDetailPageData {
	const forcePaid = preview === 'paid' || preview === 'pro';
	const forceFree = preview === 'free';
	const isFree = forcePaid ? false : forceFree || plan === 'free';

	if (!isFree) {
		return pageData;
	}

	return {
		...pageData,
		cost: null,
		invoice_enabled: false
	};
}
