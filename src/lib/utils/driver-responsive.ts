import { isActivatePreviewMode } from '$lib/utils/driver-activate-theme';
import { isDriverJobDetailPreviewMode } from '$lib/utils/driver-job-detail-theme';
import { isDriverJobStartedPreviewMode } from '$lib/utils/driver-job-started-theme';
import { isDriverReportIssuePreviewMode } from '$lib/utils/driver-report-issue-theme';
import { isDriverJobsPreviewMode } from '$lib/utils/driver-jobs-theme';
import { isDriverLoginPreviewMode } from '$lib/utils/driver-login-theme';

export function isDriverMobileBlockerPreview(preview: string | null): boolean {
	return preview === 'mobile' || preview === 'mobile-dark';
}

/** Force the driver app UI on large screens (design preview). */
export function isDriverAppPreviewMode(preview: string | null): boolean {
	return (
		isDriverLoginPreviewMode(preview) ||
		isActivatePreviewMode(preview) ||
		isDriverJobsPreviewMode(preview) ||
		isDriverJobDetailPreviewMode(preview) ||
		isDriverJobStartedPreviewMode(preview) ||
		isDriverReportIssuePreviewMode(preview)
	);
}
