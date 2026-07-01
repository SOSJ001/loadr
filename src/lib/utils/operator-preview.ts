/** Operator Figma preview helpers shared across routes and layout. */
export function isOperatorDarkPreview(preview: string | null): boolean {
	return (
		preview === 'dark' ||
		preview === 'dark-discard' ||
		preview === 'mobile-dark' ||
		preview === 'loading-dark'
	);
}

export function isOperatorLoadingPreview(preview: string | null): boolean {
	return preview === 'loading' || preview === 'loading-dark';
}

export function isCreateJobDiscardPreview(preview: string | null): boolean {
	return preview === 'discard' || preview === 'dark-discard';
}

export function isCreateJobDarkPreview(preview: string | null): boolean {
	return preview === 'dark' || preview === 'dark-discard';
}
