import {
	DRIVER_ISSUE_REASON_OPTIONS,
	type DriverIssueReasonOption
} from '$lib/types/driver-report-issue';

export const DRIVER_ISSUE_REASONS = DRIVER_ISSUE_REASON_OPTIONS.map(
	(option) => option.value
) as [
	'No answer',
	'Address not found',
	'Refused delivery',
	'Other'
];

export type DriverIssueReason = (typeof DRIVER_ISSUE_REASONS)[number];

export type { DriverIssueReasonOption };

export type DriverJobFlowContext = {
	id: string;
	reference: string;
	pickup_address: string;
	dropoff_address: string;
};
