import { error, json } from '@sveltejs/kit';
import { requireBearerOrCookie } from '$lib/server/auth';
import { jsonApiError } from '$lib/server/api/response';
import { inviteDriver, isUsersError } from '$lib/server/users';
import type { RequestHandler } from './$types';

/** POST /api/v1/users/invite — API spec Group 3 Users */
export const POST: RequestHandler = async (event) => {
	let payload: { full_name?: string; phone?: string };

	try {
		payload = await event.request.json();
	} catch {
		return jsonApiError('VALIDATION_ERROR', 'Invalid JSON body', 400);
	}

	const full_name = payload.full_name?.trim();
	const phone = payload.phone?.trim();

	if (!full_name || !phone) {
		return jsonApiError('VALIDATION_ERROR', 'full_name and phone are required', 400);
	}

	try {
		const profile = requireBearerOrCookie(event);
		if (profile.role !== 'admin') error(403, 'Forbidden');

		const driver = await inviteDriver(event.locals.supabase, profile, {
			full_name,
			phone,
			activate_base_url: event.url.origin
		});

		return json(driver, { status: 201 });
	} catch (err) {
		if (isUsersError(err)) {
			return jsonApiError(err.code, err.message, err.status);
		}
		throw err;
	}
};
