import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { type Handle, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { friendlyErrorMessage } from '$lib/utils/error-page';
import { isRemovedDriver, loadUserProfile } from '$lib/server/profile';

const supabase: Handle = async ({ event, resolve }) => {
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
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (session) {
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
		console.error('[loadr] Session lookup failed:', err);
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	if (pathname.startsWith('/api/v1/subscriptions/webhook')) {
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
