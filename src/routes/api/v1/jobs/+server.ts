import { error, json } from '@sveltejs/kit';
import { jsonApiError } from '$lib/server/api/response';
import { requireApiJobsAccess, requireProfile } from '$lib/server/auth';
import {
	createJobForUser,
	isJobsError,
	listJobsForUser,
	summarizeJobStatuses
} from '$lib/server/jobs';
import type { RequestHandler } from './$types';

/** GET /api/v1/jobs — API spec Group 4 Jobs */
export const GET: RequestHandler = async (event) => {
	const auth = requireApiJobsAccess(event);
	if (auth instanceof Response) return auth;

	const jobs = await listJobsForUser(event.locals.supabase, auth);
	return json({
		jobs,
		total: jobs.length,
		page: 1,
		limit: 20,
		counts: summarizeJobStatuses(jobs)
	});
};

/** POST /api/v1/jobs — API spec Group 4 Jobs */
export const POST: RequestHandler = async (event) => {
	const profile = requireProfile(event);
	if (profile.role !== 'admin') error(404, 'Not found');

	const body = await event.request.json();

	try {
		const job = await createJobForUser(event.locals.supabase, profile, body);
		return json(job, { status: 201 });
	} catch (err) {
		if (isJobsError(err)) {
			return jsonApiError(err.code, err.message, err.status);
		}
		throw err;
	}
};
