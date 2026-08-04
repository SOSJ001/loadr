import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { type Handle, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { friendlyErrorMessage } from '$lib/utils/error-page';
import { isRemovedDriver, loadUserProfile } from '$lib/server/profile';

/** Supabase unreachable (timeout, offline, paused project) — not an auth config bug. */
function isTransientAuthNetworkError(err: unknown): boolean {
	if (typeof err !== 'object' || err === null) return false;

	if ('status' in err && (err as { status?: unknown }).status === 0) return true;

	const code = 'code' in err ? String((err as { code?: unknown }).code) : '';
	if (code === 'UND_ERR_CONNECT_TIMEOUT' || code === 'UND_ERR_SOCKET') return true;

	const cause = 'cause' in err ? (err as { cause?: unknown }).cause : undefined;
	if (typeof cause === 'object' && cause !== null && 'code' in cause) {
		const causeCode = String((cause as { code?: unknown }).code);
		if (causeCode === 'UND_ERR_CONNECT_TIMEOUT' || causeCode === 'UND_ERR_SOCKET') {
			return true;
		}
	}

	return false;
}

const supabase: Handle = async ({ event, resolve }) => {
	// Cron routes use CRON_SECRET + admin client — skip session refresh entirely.
	if (event.url.pathname.startsWith('/api/cron/')) {
		return resolve(event);
	}

	const cookieMethods: CookieMethodsServer = {
		getAll: () => event.cookies.getAll(),
		setAll: (cookiesToSet) => {
			cookiesToSet.forEach(({ name, value, options }) => {
				event.cookies.set(name, value, { ...options, path: '/' });
			});
		}
	};

	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: cookieMethods
	});

	event.locals.session = null;
	event.locals.user = null;
	event.locals.profile = null;

	try {
		const {
			data: { session },
			error: sessionError
		} = await event.locals.supabase.auth.getSession();

		if (sessionError?.code === 'refresh_token_not_found') {
			await event.locals.supabase.auth.signOut();
		} else if (sessionError && isTransientAuthNetworkError(sessionError)) {
			// Supabase unreachable — continue unauthenticated; don't spam signOut/retries.
		} else if (sessionError) {
			console.error('[loadr] Session lookup failed:', sessionError.message);
		} else if (session) {
			event.locals.session = session;
			event.locals.user = session.user;

			const profile = await loadUserProfile(event.locals.supabase, session.user.id);

			if (profile && isRemovedDriver(profile)) {
				await event.locals.supabase.auth.signOut();
				event.locals.session = null;
				event.locals.user = null;
				event.locals.profile = null;
			} else {
				event.locals.profile = profile;
			}
		}
	} catch (err) {
		const code =
			typeof err === 'object' && err !== null && 'code' in err
				? String((err as { code?: unknown }).code)
				: '';

		if (code === 'refresh_token_not_found') {
			await event.locals.supabase.auth.signOut();
		} else if (!isTransientAuthNetworkError(err)) {
			console.error('[loadr] Session lookup failed:', err);
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	if (
		pathname.startsWith('/api/v1/subscriptions/webhook') ||
		pathname.startsWith('/api/cron/')
	) {
		return resolve(event);
	}

	return resolve(event);
};

export const handle = sequence(supabase, authGuard);

export const handleError: HandleServerError = ({ error, status, message }) => {
	const detail =
		error instanceof Error
			? error.message
			: typeof error === 'object' && error !== null && 'message' in error
				? String((error as { message?: unknown }).message ?? '')
				: String(error);

	console.error('[loadr]', status, detail || message, error);

	return {
		message: friendlyErrorMessage(error, status, message)
	};
};
