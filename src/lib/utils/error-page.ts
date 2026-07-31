/** User-facing copy for +error.svelte and handleError. */
export const SERVICE_UNAVAILABLE_MESSAGE =
	'Unable to reach the server. Check your connection and try again.';

export const OFFLINE_PAGE_UNAVAILABLE_MESSAGE =
	'This page is not available offline. Connect to load it, or open it while online first.';

export function isBrowserOffline(): boolean {
	return typeof navigator !== 'undefined' && !navigator.onLine;
}

export function isNetworkFailure(error: unknown): boolean {
	if (isConnectError(error)) return true;

	if (error instanceof TypeError) {
		return /failed to fetch|networkerror|load failed/i.test(error.message);
	}

	if (error instanceof Error) {
		return /failed to fetch|networkerror|load failed|fetch failed/i.test(error.message);
	}

	const record = error as { message?: string };
	return /failed to fetch|networkerror|load failed|fetch failed/i.test(record.message ?? '');
}

/** True when a navigation/load failure is likely due to being offline or unreachable. */
export function isOfflineNavigationError(error: unknown, status: number): boolean {
	if (status === 503) return true;
	if (isBrowserOffline()) return true;
	if (isNetworkFailure(error)) return true;

	if (error instanceof Error) {
		const message = error.message.trim().toLowerCase();
		if (message.includes('offline') || message.includes('not available offline')) {
			return true;
		}
	}

	return false;
}

export function offlineNavigationMessage(error: unknown, status: number): string | null {
	if (!isOfflineNavigationError(error, status)) return null;

	if (error instanceof Error) {
		const message = error.message.trim();
		if (
			message &&
			message !== 'Internal Error' &&
			(message.includes('offline') || message.includes('not available'))
		) {
			return message;
		}
	}

	if (isBrowserOffline()) {
		return OFFLINE_PAGE_UNAVAILABLE_MESSAGE;
	}

	return SERVICE_UNAVAILABLE_MESSAGE;
}

export function errorPageTitle(status: number, offline = false): string {
	if (offline) return "You're offline";
	if (status === 404) return 'Page not found';
	if (status === 403) return 'Access denied';
	if (status === 401) return 'Sign in required';
	if (status >= 500) return 'Something went wrong';
	return 'Something went wrong';
}

export function errorPageHomeHref(pathname: string): string {
	if (
		pathname.startsWith('/dashboard') ||
		pathname.startsWith('/drivers') ||
		pathname.startsWith('/settings')
	) {
		return '/dashboard';
	}

	if (
		pathname.startsWith('/jobs') ||
		pathname.startsWith('/profile') ||
		pathname.startsWith('/help') ||
		pathname.startsWith('/activate')
	) {
		return '/jobs';
	}

	if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
		return '/login';
	}

	return '/';
}

export function isConnectError(error: unknown): boolean {
	if (!error || typeof error !== 'object') return false;

	const record = error as { message?: string; cause?: { code?: string } };

	return (
		record.message === 'fetch failed' ||
		record.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
		record.cause?.code === 'ECONNREFUSED' ||
		record.cause?.code === 'ENOTFOUND'
	);
}

/** Supabase Auth network/timeout failures — not invalid credentials. */
export function isAuthNetworkError(error: unknown): boolean {
	if (isConnectError(error)) return true;

	if (error instanceof DOMException && error.name === 'TimeoutError') {
		return true;
	}

	if (error instanceof Error) {
		if (error.name === 'AuthRetryableFetchError') return true;
		if (error.message.includes('aborted due to timeout')) return true;
	}

	const record = error as { name?: string; message?: string };
	return (
		record.name === 'AuthRetryableFetchError' ||
		(record.message?.includes('aborted due to timeout') ?? false)
	);
}

export function isInvalidLoginError(error: unknown): boolean {
	const record = error as { name?: string; status?: number; code?: string; message?: string };

	if (record.name !== 'AuthApiError') return false;

	return (
		record.status === 400 ||
		record.code === 'invalid_credentials' ||
		/invalid login credentials/i.test(record.message ?? '')
	);
}

export function friendlyErrorMessage(error: unknown, status: number, fallback: string): string {
	const offlineMessage = offlineNavigationMessage(error, status);
	if (offlineMessage) return offlineMessage;

	if (isConnectError(error)) {
		return SERVICE_UNAVAILABLE_MESSAGE;
	}

	if (error instanceof Error && error.message.trim()) {
		const message = error.message.trim();

		if (status >= 500 && message === 'Internal Error') {
			return 'Something went wrong. Please try again in a moment.';
		}

		if (status < 500) {
			return message;
		}
	}

	if (status === 404) return 'The page you requested does not exist or may have been moved.';
	if (status === 403) return "You don't have permission to view this page.";
	if (status === 401) return 'Please sign in to continue.';
	if (status >= 500) return 'Something went wrong. Please try again in a moment.';

	return fallback;
}
