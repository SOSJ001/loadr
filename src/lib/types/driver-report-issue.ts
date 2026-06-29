export type DriverIssueReasonOption = {
	value: string;
	label: string;
	description: string;
};

export const DRIVER_ISSUE_REASON_OPTIONS: DriverIssueReasonOption[] = [
	{
		value: 'No answer',
		label: 'No answer',
		description: 'Nobody available to receive the goods'
	},
	{
		value: 'Address not found',
		label: 'Address not found',
		description: 'Could not locate the drop off address'
	},
	{
		value: 'Refused delivery',
		label: 'Refused delivery',
		description: 'Recipient declined to accept the goods'
	},
	{
		value: 'Other',
		label: 'Other',
		description: 'Something else happened'
	}
];

export const REPORT_ISSUE_NOTES_MAX_LENGTH = 300;

export const REPORT_ISSUE_OTHER_DESCRIPTION_MAX_LENGTH = 200;
