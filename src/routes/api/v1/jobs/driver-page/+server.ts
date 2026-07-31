import { error, json } from '@sveltejs/kit';
import { fetchDriverJobsPageData } from '$lib/server/driver-jobs-page';
import { requireApiJobsAccess } from '$lib/server/auth';
import { toDateKey } from '$lib/utils/driver-jobs';
import type { RequestHandler } from './$types';

/** GET /api/v1/jobs/driver-page?date= — driver jobs list for PWA offline cache */
export const GET: RequestHandler = async (event) => {
	const profile = requireApiJobsAccess(event);
	if (profile instanceof Response) return profile;

	if (profile.role !== 'driver') {
		error(404, 'Not found');
	}

	const date = event.url.searchParams.get('date') ?? toDateKey(new Date());
	const pageData = await fetchDriverJobsPageData(event.locals.supabase, profile, date);

	return json({ pageData });
};
