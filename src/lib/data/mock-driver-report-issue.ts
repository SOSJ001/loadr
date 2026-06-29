import type { DriverJobFlowContext } from '$lib/types/driver-job-flow';

/** Figma 9A — Report Issue (Empty), #0042 */
export function mockDriverReportIssueJob(): DriverJobFlowContext {
	return {
		id: 'job-0042',
		reference: '#0042',
		pickup_address: '14 Bold Street, Liverpool, L1 4AF',
		dropoff_address: '22 King Street, Manchester, M2 6DL'
	};
}

/** Figma 9C — pre-filled additional notes */
export const MOCK_REPORT_ISSUE_PREVIEW_NOTES =
	'Gate was locked, no one answered the intercom.';
