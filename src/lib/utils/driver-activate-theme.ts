export function isActivatePreviewMode(preview: string | null): boolean {
	return (
		preview === '1' ||
		preview === 'sms' ||
		preview === '2' ||
		preview === '2a' ||
		preview === '2b' ||
		preview === '2c' ||
		preview === '2d' ||
		preview === '2e' ||
		preview === '2f' ||
		preview === '2g' ||
		preview === 'install' ||
		preview === '1a' ||
		preview === '1b' ||
		preview === 'dark' ||
		preview === 'light'
	);
}

export function isActivateInstallPreview(preview: string | null): boolean {
	return preview === '2f' || preview === 'install';
}

export function isActivateLightInstallPreview(preview: string | null): boolean {
	return preview === '2g';
}

export function isActivateSetupPreview(preview: string | null): boolean {
	return preview === '2' || preview === '2a' || preview === '2b' || preview === '2c' || preview === '2e';
}

export function isActivateSuccessPreview(preview: string | null): boolean {
	return preview === '2d';
}

export function resolveActivateStep(
	url: URL,
	preview: string | null
): 'invite' | 'install' | 'setup' | 'success' {
	if (url.searchParams.get('step') === 'success' || isActivateSuccessPreview(preview)) {
		return 'success';
	}
	if (url.searchParams.get('step') === 'setup' || isActivateSetupPreview(preview)) {
		return 'setup';
	}
	if (
		url.searchParams.get('step') === 'install' ||
		isActivateInstallPreview(preview) ||
		isActivateLightInstallPreview(preview)
	) {
		return 'install';
	}
	return 'invite';
}

export function isActivateTypingPreview(preview: string | null): boolean {
	return preview === '2b' || preview === '2e';
}

export function isActivateLightSetupPreview(preview: string | null): boolean {
	return preview === '2e';
}

export function isActivateErrorsPreview(preview: string | null): boolean {
	return preview === '2c';
}

export const ACTIVATE_TYPING_PREVIEW_PASSWORD = 'SecurePass12!';

export const ACTIVATE_ERRORS_PREVIEW_FIELD_ERRORS = {
	password: 'Password must be at least 8 characters',
	confirm_password: "Passwords don't match"
} as const;
