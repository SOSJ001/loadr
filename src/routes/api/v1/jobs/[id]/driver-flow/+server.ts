import { error, json } from '@sveltejs/kit';
import { getJobForUser } from '$lib/server/jobs';
import { requireApiJobsAccess } from '$lib/server/auth';
import { toDriverJobFlowContext } from '$lib/server/driver-job-flow';
import type { RequestHandler } from './$types';

/** GET /api/v1/jobs/:id/driver-flow — complete/report flow context for PWA offline cache */
export const GET: RequestHandler = async (event) => {
	const profile = requireApiJobsAccess(event);
	if (profile instanceof Response) return profile;

	if (profile.role !== 'driver') {
		error(404, 'Not found');
	}

	const job = await getJobForUser(event.locals.supabase, profile, event.params.id);
	if (!job) {
		error(404, 'Not found');
	}

	if (job.status !== 'in_progress') {
		error(404, 'Not found');
	}

	return json({ job: toDriverJobFlowContext(job) });
};
