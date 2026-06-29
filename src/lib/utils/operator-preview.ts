/** Operator Figma preview helpers shared across routes and layout. */
export function isOperatorDarkPreview(preview: string | null): boolean {
	return preview === 'dark' || preview === 'dark-discard' || preview === 'mobile-dark';
}

export function isCreateJobDiscardPreview(preview: string | null): boolean {
	return preview === 'discard' || preview === 'dark-discard';
}

export function isCreateJobDarkPreview(preview: string | null): boolean {
	return preview === 'dark' || preview === 'dark-discard';
}
