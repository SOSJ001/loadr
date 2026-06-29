import { error, json } from '@sveltejs/kit';
import { requireBearerOrCookie } from '$lib/server/auth';
import { jsonApiError } from '$lib/server/api/response';
import { isUsersError, listDriversForCompany } from '$lib/server/users';
import type { RequestHandler } from './$types';

function requireOperatorProfile(event: Parameters<RequestHandler>[0]) {
	const profile = requireBearerOrCookie(event);
	if (profile.role !== 'admin') error(403, 'Forbidden');
	return profile;
}

/** GET /api/v1/users — API spec Group 3 Users */
export const GET: RequestHandler = async (event) => {
	try {
		const profile = requireOperatorProfile(event);
		const drivers = await listDriversForCompany(event.locals.supabase, profile);
		return json({ users: drivers, total: drivers.length });
	} catch (err) {
		if (isUsersError(err)) {
			return jsonApiError(err.code, err.message, err.status);
		}
		throw err;
	}
};

/** POST /api/v1/users — API spec Group 3 Users (invite via /invite preferred) */
export const POST: RequestHandler = async (event) => {
	error(405, 'Method Not Allowed');
};
