import type { RequestHandler } from './$types';
import { jsonApiError, jsonOk } from '$lib/server/api/response';
import { resetPasswordWithSession, resetPasswordWithToken } from '$lib/server/auth-api';

/** POST /api/v1/auth/reset-password — API spec Group 1 Auth */
export const POST: RequestHandler = async (event) => {
	let payload: { access_token?: string; new_password?: string };

	try {
		payload = await event.request.json();
	} catch {
		return jsonApiError('VALIDATION_ERROR', 'Invalid JSON body', 400);
	}

	if (!payload.new_password) {
		return jsonApiError('VALIDATION_ERROR', 'new_password is required', 400);
	}

	if (payload.new_password.length < 8) {
		return jsonApiError('VALIDATION_ERROR', 'new_password must be at least 8 characters', 400);
	}

	const hasToken = Boolean(payload.access_token?.trim());
	const hasSession = Boolean(event.locals.session);

	if (!hasToken && !hasSession) {
		return jsonApiError('TOKEN_EXPIRED', 'Invalid or expired reset token', 401);
	}

	try {
		const user = hasToken
			? await resetPasswordWithToken({
					access_token: payload.access_token!.trim(),
					new_password: payload.new_password
				})
			: await resetPasswordWithSession(event.locals.supabase, payload.new_password);

		await event.locals.supabase.auth.signOut();

		return jsonOk({ message: 'Password reset successful', user_id: user?.id ?? null });
	} catch {
		return jsonApiError('TOKEN_EXPIRED', 'Invalid or expired reset token', 401);
	}
};
