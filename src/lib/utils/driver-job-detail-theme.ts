export function isDriverJobDetailPreviewMode(preview: string | null): boolean {
	return (
		preview === '5a' ||
		preview === 'pending' ||
		preview === '5b' ||
		preview === 'in_progress' ||
		preview === '5c' ||
		preview === 'complete' ||
		preview === '5d' ||
		preview === 'attempted' ||
		preview === '5e' ||
		preview === 'light-in-progress'
	);
}

export function isDriverJobDetailLightPreview(preview: string | null): boolean {
	return preview === '5e' || preview === 'light-in-progress' || preview === 'light';
}

export function resolveDriverJobDetailThemeHint(
	preview: string | null
): 'light' | 'dark' | null {
	if (isDriverJobDetailLightPreview(preview)) return 'light';
	if (isDriverJobDetailPreviewMode(preview)) return 'dark';
	return null;
}
