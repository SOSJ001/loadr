import type { RequestHandler } from './$types';
import { jsonApiError, jsonOk } from '$lib/server/api/response';
import { sendResetPassword } from '$lib/server/auth-api';

/** POST /api/v1/auth/forgot-password — API spec Group 1 Auth */
export const POST: RequestHandler = async (event) => {
	let payload: { email?: string; redirect_to?: string };

	try {
		payload = await event.request.json();
	} catch {
		return jsonApiError('VALIDATION_ERROR', 'Invalid JSON body', 400);
	}

	const email = payload.email?.trim();
	if (!email) {
		return jsonApiError('VALIDATION_ERROR', 'email is required', 400);
	}

	const redirectTo =
		payload.redirect_to ??
		`${event.url.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`;

	try {
		await sendResetPassword(event.locals.supabase, {
			email,
			redirect_to: redirectTo
		});
	} catch {
		// Deliberately hide whether an email exists.
	}

	return jsonOk({ message: 'If the account exists, reset instructions have been sent.' });
};
