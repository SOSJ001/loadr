import { error, json } from '@sveltejs/kit';
import { requireApiJobsAccess } from '$lib/server/auth';
import { fetchDriverJobDetailPageData } from '$lib/server/driver-job-detail';
import type { RequestHandler } from './$types';

/** GET /api/v1/jobs/:id/driver-detail — driver job detail for PWA offline cache */
export const GET: RequestHandler = async (event) => {
	const profile = requireApiJobsAccess(event);
	if (profile instanceof Response) return profile;

	if (profile.role !== 'driver') {
		error(404, 'Not found');
	}

	const driverPageData = await fetchDriverJobDetailPageData(
		event.locals.supabase,
		profile,
		event.params.id
	);

	if (!driverPageData) {
		error(404, 'Not found');
	}

	return json({ driverPageData });
};
