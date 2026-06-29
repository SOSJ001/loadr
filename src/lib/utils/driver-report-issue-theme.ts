import { MOCK_REPORT_ISSUE_PREVIEW_NOTES } from '$lib/data/mock-driver-report-issue';

/** Dropoff line for the job ref strip (Figma 9A/9B). */
export function reportIssueJobRefLabel(dropoffAddress: string): string {
	return dropoffAddress.replace(/,\s*[A-Z]{1,2}\d[\dA-Z]?\s*\d[A-Z]{2}$/i, '').trim();
}

export function isDriverReportIssueSelectedPreview(preview: string | null): boolean {
	return preview === '9b' || preview === 'report-issue-selected' || preview === 'selected';
}

export function isDriverReportIssueLightPreview(preview: string | null): boolean {
	return preview === '9e' || preview === 'report-issue-light';
}

export function isDriverReportIssuePhotoPreview(preview: string | null): boolean {
	return preview === '9f' || preview === 'report-issue-photo' || preview === 'photo';
}

export function isDriverReportIssueFilledPreview(preview: string | null): boolean {
	return preview === '9c' || preview === 'report-issue-filled' || preview === 'filled';
}

export function isDriverReportIssueSuccessPreview(preview: string | null): boolean {
	return preview === '9d' || preview === 'report-issue-success' || preview === 'success';
}

export function isDriverReportIssueFormPreviewMode(preview: string | null): boolean {
	return (
		preview === '9a' ||
		preview === 'report-issue' ||
		preview === 'report-issue-empty' ||
		isDriverReportIssueSelectedPreview(preview) ||
		isDriverReportIssueFilledPreview(preview) ||
		isDriverReportIssueLightPreview(preview) ||
		isDriverReportIssuePhotoPreview(preview)
	);
}

export function isDriverReportIssuePreviewMode(preview: string | null): boolean {
	return isDriverReportIssueFormPreviewMode(preview) || isDriverReportIssueSuccessPreview(preview);
}

export function resolveDriverReportIssueThemeHint(
	preview: string | null
): 'light' | 'dark' | null {
	if (isDriverReportIssueLightPreview(preview)) return 'light';
	if (isDriverReportIssuePreviewMode(preview)) return 'dark';
	return null;
}

export function reportIssuePreviewSelectedReason(preview: string | null): string {
	if (isDriverReportIssueFilledPreview(preview)) return 'Other';
	if (
		isDriverReportIssueSelectedPreview(preview) ||
		isDriverReportIssueLightPreview(preview) ||
		isDriverReportIssuePhotoPreview(preview)
	) {
		return 'No answer';
	}
	return '';
}

export function reportIssuePreviewInitialNotes(preview: string | null): string {
	return isDriverReportIssueFilledPreview(preview) ? MOCK_REPORT_ISSUE_PREVIEW_NOTES : '';
}

export function reportIssuePreviewPhotoAttached(preview: string | null): boolean {
	return isDriverReportIssueFilledPreview(preview) || isDriverReportIssuePhotoPreview(preview);
}
