import type { RequestHandler } from './$types';
import { jsonApiError, jsonOk } from '$lib/server/api/response';
import {
	DriverLoginError,
	isDriverLoginError,
	loginWithEmail,
	loginWithPhone,
	logoutWithSession
} from '$lib/server/auth-api';
import {
	isAuthNetworkError,
	isInvalidLoginError,
	SERVICE_UNAVAILABLE_MESSAGE
} from '$lib/utils/error-page';

/** POST /api/v1/auth/login — API spec Group 1 Auth */
export const POST: RequestHandler = async (event) => {
	let payload: { email?: string; phone?: string; password?: string };

	try {
		payload = await event.request.json();
	} catch {
		return jsonApiError('VALIDATION_ERROR', 'Invalid JSON body', 400);
	}

	const emailInput = payload.email?.trim();
	const phoneInput = payload.phone?.trim();
	const password = payload.password;

	if (!password) {
		return jsonApiError('VALIDATION_ERROR', 'password is required', 400);
	}

	if (emailInput && phoneInput) {
		return jsonApiError('VALIDATION_ERROR', 'Provide email or phone, not both', 400);
	}

	if (!emailInput && !phoneInput) {
		return jsonApiError('VALIDATION_ERROR', 'email or phone is required', 400);
	}

	const usedPhoneLogin = Boolean(phoneInput);

	if (phoneInput) {
		try {
			const { data, profile } = await loginWithPhone(event.locals.supabase, {
				phone: phoneInput,
				password
			});

			return jsonOk({
				access_token: data.session?.access_token ?? null,
				refresh_token: data.session?.refresh_token ?? null,
				token_type: data.session?.token_type ?? null,
				expires_in: data.session?.expires_in ?? null,
				user: data.user,
				role: profile.role,
				status: profile.status
			});
		} catch (err) {
			if (isDriverLoginError(err)) {
				return jsonApiError(err.code, err.message, err.status);
			}

			if (isAuthNetworkError(err)) {
				console.error('[loadr] Login network error:', err);
				return jsonApiError('SERVER_ERROR', SERVICE_UNAVAILABLE_MESSAGE, 503);
			}

			console.error('[loadr] Driver login error:', err);
			return jsonApiError('SERVER_ERROR', 'Something went wrong. Please try again.', 500);
		}
	}

	try {
		const data = await loginWithEmail(event.locals.supabase, {
			email: emailInput!,
			password
		});

		const { data: profile, error: profileError } = await event.locals.supabase
			.from('users')
			.select('role, status')
			.eq('id', data.user.id)
			.single();

		if (profileError || !profile) {
			await logoutWithSession(event.locals.supabase);
			return jsonApiError('UNAUTHORISED', 'Invalid email or password', 401);
		}

		return jsonOk({
			access_token: data.session?.access_token ?? null,
			refresh_token: data.session?.refresh_token ?? null,
			token_type: data.session?.token_type ?? null,
			expires_in: data.session?.expires_in ?? null,
			user: data.user,
			role: profile.role,
			status: profile.status
		});
	} catch (err) {
		if (isAuthNetworkError(err)) {
			console.error('[loadr] Login network error:', err);
			return jsonApiError('SERVER_ERROR', SERVICE_UNAVAILABLE_MESSAGE, 503);
		}

		if (isInvalidLoginError(err)) {
			return jsonApiError('UNAUTHORISED', 'Invalid email or password', 401);
		}

		console.error('[loadr] Login error:', err);
		return jsonApiError('SERVER_ERROR', 'Something went wrong. Please try again.', 500);
	}
};
