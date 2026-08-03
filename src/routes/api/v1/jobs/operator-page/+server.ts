import { error, json } from '@sveltejs/kit';
import { buildOperatorJobsPageData } from '$lib/server/operator-jobs';
import { requireApiJobsAccess } from '$lib/server/auth';
import type { RequestHandler } from './$types';

/** GET /api/v1/jobs/operator-page — operator jobs list for /jobs page load */
export const GET: RequestHandler = async (event) => {
	const profile = requireApiJobsAccess(event);
	if (profile instanceof Response) return profile;

	if (profile.role !== 'admin') {
		error(404, 'Not found');
	}

	const pageData = await buildOperatorJobsPageData(event.locals.supabase, profile);

	return json({
		jobs: pageData.jobs,
		stats: pageData.stats,
		drivers: pageData.drivers
	});
};
