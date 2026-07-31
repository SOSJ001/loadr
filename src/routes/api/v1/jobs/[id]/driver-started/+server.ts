import { error, json } from '@sveltejs/kit';
import { requireApiJobsAccess } from '$lib/server/auth';
import { fetchDriverJobStartedPageData } from '$lib/server/driver-job-started';
import type { RequestHandler } from './$types';

/** GET /api/v1/jobs/:id/driver-started — driver started screen for PWA offline cache */
export const GET: RequestHandler = async (event) => {
	const profile = requireApiJobsAccess(event);
	if (profile instanceof Response) return profile;

	if (profile.role !== 'driver') {
		error(404, 'Not found');
	}

	const pageData = await fetchDriverJobStartedPageData(
		event.locals.supabase,
		profile,
		event.params.id
	);

	if (!pageData) {
		error(404, 'Not found');
	}

	return json({ pageData });
};
