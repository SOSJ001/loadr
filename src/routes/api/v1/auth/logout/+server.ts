import type { RequestHandler } from './$types';
import { jsonApiError, jsonOk } from '$lib/server/api/response';
import { logoutWithSession } from '$lib/server/auth-api';

/** POST /api/v1/auth/logout — API spec Group 1 Auth */
export const POST: RequestHandler = async ({ locals: { supabase } }) => {
	try {
		await logoutWithSession(supabase);
		return jsonOk({});
	} catch {
		return jsonApiError('SERVER_ERROR', 'Logout failed', 500);
	}
};
