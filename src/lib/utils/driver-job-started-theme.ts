export function isDriverJobStartedAutoDismissPreview(preview: string | null): boolean {
	return preview === '6d' || preview === 'auto-dismiss';
}

export function isDriverJobStartedLightPreview(preview: string | null): boolean {
	return preview === '6c' || preview === 'started-light' || preview === 'light-started';
}

export function isDriverJobStartedFragilePreview(preview: string | null): boolean {
	return preview === '6b' || preview === 'started-fragile' || preview === 'fragile';
}

export function isDriverJobStartedPreviewMode(preview: string | null): boolean {
	return (
		preview === '6a' ||
		preview === 'started' ||
		isDriverJobStartedFragilePreview(preview) ||
		isDriverJobStartedLightPreview(preview) ||
		isDriverJobStartedAutoDismissPreview(preview)
	);
}

export function resolveDriverJobStartedThemeHint(
	preview: string | null
): 'light' | 'dark' | null {
	if (isDriverJobStartedLightPreview(preview)) return 'light';
	if (isDriverJobStartedPreviewMode(preview)) return 'dark';
	return null;
}
