import type { DriverJobDetailPageData } from '$lib/types/driver-job-detail';

/** Figma 5A — Job Detail (Pending), #0042 */
export function mockDriverJobDetailPending(): DriverJobDetailPageData {
	return {
		id: 'job-0042',
		reference: '#0042',
		status: 'pending',
		pickup_address: '14 Bold Street, Liverpool, L1 4AF',
		dropoff_address: '22 King Street, Manchester, M2 6DL',
		scheduled_date_label: 'Mon 9 Jun 2026',
		scheduled_time_label: '9:30am',
		vehicle_label: 'Ford Transit Van',
		notes: 'Fragile, leave at reception. Call ahead: 07700 900123',
		directions_address: '14 Bold Street, Liverpool, L1 4AF',
		progress_stages: [
			{
				id: 'created',
				label: 'Job created',
				subtitle: 'Assigned to you',
				state: 'complete',
				timestamp: '2026-06-09T07:47:00.000Z'
			},
			{
				id: 'picked_up',
				label: 'Picked up',
				subtitle: 'Goods collected',
				state: 'upcoming',
				timestamp: null
			},
			{
				id: 'delivered',
				label: 'Delivered',
				subtitle: 'Proof of delivery saved',
				state: 'upcoming',
				timestamp: null
			},
			{
				id: 'complete',
				label: 'Complete',
				subtitle: 'Job closed',
				state: 'upcoming',
				timestamp: null
			}
		],
		primary_action: {
			kind: 'start',
			label: 'Start job',
			hint: "Tap when you've collected the goods"
		},
		secondary_actions: [],
		completion_banner: null,
		attempted_banner: null
	};
}

/** Figma 5B / 5E — Job Detail (In Progress), #0042 */
export function mockDriverJobDetailInProgress(): DriverJobDetailPageData {
	return {
		id: 'job-0042',
		reference: '#0042',
		status: 'in_progress',
		pickup_address: '14 Bold Street, Liverpool, L1 4AF',
		dropoff_address: '22 King Street, Manchester, M2 6DL',
		scheduled_date_label: 'Mon 9 Jun 2026',
		scheduled_time_label: '9:30am',
		vehicle_label: 'Ford Transit Van',
		notes: 'Fragile, leave at reception. Call ahead: 07700 900123',
		directions_address: '22 King Street, Manchester, M2 6DL',
		progress_stages: [
			{
				id: 'created',
				label: 'Job created',
				subtitle: 'Assigned to you',
				state: 'complete',
				timestamp: '2026-06-09T07:47:00.000Z'
			},
			{
				id: 'picked_up',
				label: 'Picked up',
				subtitle: 'In progress...',
				state: 'current',
				timestamp: '2026-06-09T08:14:00.000Z'
			},
			{
				id: 'delivered',
				label: 'Delivered',
				subtitle: 'Proof of delivery saved',
				state: 'upcoming',
				timestamp: null
			},
			{
				id: 'complete',
				label: 'Complete',
				subtitle: 'Job closed',
				state: 'upcoming',
				timestamp: null
			}
		],
		primary_action: {
			kind: 'complete',
			label: 'Complete job',
			hint: 'Tap when goods have been delivered',
			href: '/jobs/job-0042/complete'
		},
		secondary_actions: [
			{
				kind: 'report_issue',
				label: 'Report issue',
				href: '/jobs/job-0042/report-issue'
			}
		],
		completion_banner: null,
		attempted_banner: null
	};
}

/** Figma 5C — Job Detail (Complete), #0042 */
export function mockDriverJobDetailComplete(): DriverJobDetailPageData {
	return {
		id: 'job-0042',
		reference: '#0042',
		status: 'complete',
		pickup_address: '14 Bold Street, Liverpool, L1 4AF',
		dropoff_address: '22 King Street, Manchester, M2 6DL',
		scheduled_date_label: 'Mon 9 Jun 2026',
		scheduled_time_label: '9:30am',
		vehicle_label: 'Ford Transit Van',
		notes: 'Fragile, leave at reception. Call ahead: 07700 900123',
		directions_address: '22 King Street, Manchester, M2 6DL',
		progress_stages: [
			{
				id: 'created',
				label: 'Job created',
				subtitle: 'Assigned to you',
				state: 'complete',
				timestamp: '2026-06-09T07:47:00.000Z'
			},
			{
				id: 'picked_up',
				label: 'Picked up',
				subtitle: 'Goods collected',
				state: 'complete',
				timestamp: '2026-06-09T08:14:00.000Z'
			},
			{
				id: 'delivered',
				label: 'Delivered',
				subtitle: 'Proof of delivery saved',
				state: 'complete',
				timestamp: '2026-06-09T10:30:00.000Z'
			},
			{
				id: 'complete',
				label: 'Complete',
				subtitle: 'Job closed',
				state: 'complete',
				timestamp: '2026-06-09T10:42:00.000Z'
			}
		],
		primary_action: null,
		secondary_actions: [],
		completion_banner: { time_label: '11:42am' },
		attempted_banner: null
	};
}

/** Figma 5D — Job Detail (Attempted), #0042 */
export function mockDriverJobDetailAttempted(): DriverJobDetailPageData {
	return {
		id: 'job-0042',
		reference: '#0042',
		status: 'attempted',
		pickup_address: '14 Bold Street, Liverpool, L1 4AF',
		dropoff_address: '22 King Street, Manchester, M2 6DL',
		scheduled_date_label: 'Mon 9 Jun 2026',
		scheduled_time_label: '9:30am',
		vehicle_label: 'Ford Transit Van',
		notes: 'Fragile, leave at reception. Call ahead: 07700 900123',
		directions_address: '22 King Street, Manchester, M2 6DL',
		progress_stages: [
			{
				id: 'created',
				label: 'Job created',
				subtitle: 'Assigned to you',
				state: 'complete',
				timestamp: '2026-06-09T07:47:00.000Z'
			},
			{
				id: 'picked_up',
				label: 'Picked up',
				subtitle: 'Goods collected',
				state: 'complete',
				timestamp: '2026-06-09T08:14:00.000Z'
			},
			{
				id: 'delivered',
				label: 'Delivery attempted',
				subtitle: '',
				state: 'current',
				tone: 'danger',
				reason_tag: 'No answer',
				timestamp: '2026-06-09T09:05:00.000Z'
			},
			{
				id: 'complete',
				label: 'Complete',
				subtitle: 'Job closed',
				state: 'upcoming',
				timestamp: null
			}
		],
		primary_action: null,
		secondary_actions: [],
		completion_banner: null,
		attempted_banner: { reason: 'No answer' }
	};
}
