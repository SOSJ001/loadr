export type DriverLoginThemeHint = 'light' | 'dark';

export function isDriverLoginPreviewMode(preview: string | null): boolean {
	return (
		preview === '3a' ||
		preview === '3A' ||
		preview === '3b' ||
		preview === '3B' ||
		preview === '3c' ||
		preview === '3C' ||
		preview === '3d' ||
		preview === '3D' ||
		preview === 'light'
	);
}

export function isDriverLoginLightPreview(preview: string | null): boolean {
	return preview === '3d' || preview === '3D' || preview === 'light';
}

export function resolveDriverLoginThemeHint(
	preview: string | null
): DriverLoginThemeHint | null {
	if (isDriverLoginLightPreview(preview)) return 'light';
	if (isDriverLoginPreviewMode(preview)) return 'dark';
	return null;
}

export function isDriverLoginFilledPreview(preview: string | null): boolean {
	return (
		preview === '3b' ||
		preview === '3B' ||
		preview === '3c' ||
		preview === '3C'
	);
}

export function isDriverLoginErrorPreview(preview: string | null): boolean {
	return preview === '3c' || preview === '3C';
}

export const DRIVER_LOGIN_PREVIEW_PHONE = '07700 900123';
export const DRIVER_LOGIN_PREVIEW_PASSWORD = 'SecurePass12!';

export const DRIVER_LOGIN_AUTH_BANNER_MESSAGE =
	'Incorrect phone or password. Try again.';
export const DRIVER_LOGIN_PASSWORD_AUTH_ERROR = 'Incorrect password';
