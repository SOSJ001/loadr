import type { UserRole } from '$lib/types/user';

const AUTH_PATHS = new Set([
	'/login',
	'/login/driver',
	'/signup',
	'/forgot-password',
	'/reset-password',
	'/verify-email'
]);

export function isSafeRedirect(path: string): boolean {
	if (!path.startsWith('/') || path.startsWith('//')) {
		return false;
	}

	const pathname = path.split(/[?#]/)[0] ?? path;
	return !AUTH_PATHS.has(pathname);
}

export function defaultPathForRole(role: UserRole | null | undefined): string {
	if (role === 'driver') {
		return '/jobs';
	}

	return '/dashboard';
}

export function resolvePostLoginPath(
	role: UserRole | null | undefined,
	redirectParam: string | null
): string {
	if (redirectParam && isSafeRedirect(redirectParam)) {
		return redirectParam;
	}

	return defaultPathForRole(role);
}
