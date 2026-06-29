import { error, json } from '@sveltejs/kit';
import { requireBearerOrCookie } from '$lib/server/auth';
import { jsonApiError } from '$lib/server/api/response';
import { getDriverForCompany, isUsersError, removeDriver } from '$lib/server/users';
import type { RequestHandler } from './$types';

/** GET /api/v1/users/:id — API spec Group 3 Users */
export const GET: RequestHandler = async (event) => {
	try {
		const profile = requireBearerOrCookie(event);
		if (profile.role !== 'admin') error(403, 'Forbidden');

		const driver = await getDriverForCompany(event.locals.supabase, profile, event.params.id);
		if (!driver) error(404, 'Not found');
		return json(driver);
	} catch (err) {
		if (isUsersError(err)) {
			return jsonApiError(err.code, err.message, err.status);
		}
		throw err;
	}
};

/** DELETE /api/v1/users/:id — API spec Group 3 Users */
export const DELETE: RequestHandler = async (event) => {
	try {
		const profile = requireBearerOrCookie(event);
		if (profile.role !== 'admin') error(403, 'Forbidden');

		const removed = await removeDriver(event.locals.supabase, profile, event.params.id);
		if (!removed) error(404, 'Not found');
		return json({ ok: true });
	} catch (err) {
		if (isUsersError(err)) {
			return jsonApiError(err.code, err.message, err.status);
		}
		throw err;
	}
};
