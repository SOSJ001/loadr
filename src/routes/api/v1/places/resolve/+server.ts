import { error, json } from '@sveltejs/kit';
import { jsonApiError } from '$lib/server/api/response';
import { isPlacesError, resolveAddressSuggestion } from '$lib/server/places';
import type { RequestHandler } from './$types';

/** POST /api/v1/places/resolve — resolve lat/lng for a selected autocomplete row */
export const POST: RequestHandler = async (event) => {
	const profile = event.locals.profile;
	if (!profile || profile.role !== 'admin') {
		error(404, 'Not found');
	}

	const body = (await event.request.json().catch(() => null)) as { placeId?: string } | null;
	const placeId = body?.placeId?.trim() ?? '';

	if (!placeId) {
		return jsonApiError('VALIDATION_ERROR', 'placeId is required', 400);
	}

	try {
		const suggestion = await resolveAddressSuggestion(placeId);
		return json({ suggestion });
	} catch (err) {
		if (isPlacesError(err)) {
			return jsonApiError(err.code, err.message, err.status);
		}
		throw err;
	}
};
