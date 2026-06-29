import { error, json } from '@sveltejs/kit';
import { jsonApiError } from '$lib/server/api/response';
import { isPlacesMockEnabled } from '$lib/server/places-mock';
import { isPlacesError, searchAddress } from '$lib/server/places';
import type { RequestHandler } from './$types';

/** GET /api/v1/places/search?q= — admin-only address autocomplete */
export const GET: RequestHandler = async (event) => {
	const profile = event.locals.profile;
	if (!profile || profile.role !== 'admin') {
		error(404, 'Not found');
	}

	const query = event.url.searchParams.get('q') ?? '';

	try {
		const suggestions = await searchAddress(query);
		return json({ suggestions, mock: isPlacesMockEnabled() });
	} catch (err) {
		if (isPlacesError(err)) {
			return jsonApiError(err.code, err.message, err.status);
		}
		throw err;
	}
};
