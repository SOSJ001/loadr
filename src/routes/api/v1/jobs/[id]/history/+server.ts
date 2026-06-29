import { error, json } from '@sveltejs/kit';
import { requireApiJobsAccess } from '$lib/server/auth';
import { getJobForUser } from '$lib/server/jobs';
import type { RequestHandler } from './$types';

/** GET /api/v1/jobs/:id/history — API spec Group 6 Job Status History */
export const GET: RequestHandler = async (event) => {
	const auth = requireApiJobsAccess(event);
	if (auth instanceof Response) return auth;

	const job = await getJobForUser(event.locals.supabase, auth, event.params.id);
	if (!job) error(404, 'Not found');

	const { data, error: historyError } = await event.locals.supabase
		.from('job_status_history')
		.select('*')
		.eq('job_id', job.id)
		.order('created_at', { ascending: true });

	if (historyError) error(500, historyError.message);
	return json({ history: data ?? [] });
};
