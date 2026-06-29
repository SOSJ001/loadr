import { error, json } from '@sveltejs/kit';
import { requireBearerOrCookie } from '$lib/server/auth';
import { jsonApiError } from '$lib/server/api/response';
import { isUsersError, resendInvite } from '$lib/server/users';
import type { RequestHandler } from './$types';

/** POST /api/v1/users/:id/resend-invite — API spec Group 3 Users */
export const POST: RequestHandler = async (event) => {
	try {
		const profile = requireBearerOrCookie(event);
		if (profile.role !== 'admin') error(403, 'Forbidden');

		const driver = await resendInvite(
			event.locals.supabase,
			profile,
			event.params.id,
			event.url.origin
		);

		if (!driver) error(404, 'Not found');

		return json(driver);
	} catch (err) {
		if (isUsersError(err)) {
			return jsonApiError(err.code, err.message, err.status);
		}
		throw err;
	}
};
