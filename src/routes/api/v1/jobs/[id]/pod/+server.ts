import { error, json } from '@sveltejs/kit';
import { jsonApiError } from '$lib/server/api/response';
import { requireApiJobsAccess } from '$lib/server/auth';
import { getJobForUser, isJobsError } from '$lib/server/jobs';
import { getPodForJob, uploadPodForJob } from '$lib/server/pod';
import type { RequestHandler } from './$types';

/** GET /api/v1/jobs/:id/pod — API spec Group 5 Proof of Delivery */
export const GET: RequestHandler = async (event) => {
	const auth = requireApiJobsAccess(event);
	if (auth instanceof Response) return auth;

	const job = await getJobForUser(event.locals.supabase, auth, event.params.id);
	if (!job) error(404, 'Not found');

	const pod = await getPodForJob(event.locals.supabase, auth, event.params.id);
	return json({ pod });
};

/** POST /api/v1/jobs/:id/pod — API spec Group 5 Proof of Delivery */
export const POST: RequestHandler = async (event) => {
	const auth = requireApiJobsAccess(event);
	if (auth instanceof Response) return auth;

	if (auth.role !== 'driver') {
		return jsonApiError('FORBIDDEN', 'Forbidden', 403);
	}

	const job = await getJobForUser(event.locals.supabase, auth, event.params.id);
	if (!job) error(404, 'Not found');

	const formData = await event.request.formData();

	try {
		const updatedJob = await uploadPodForJob(
			event.locals.supabase,
			auth,
			event.params.id,
			formData
		);
		return json(updatedJob, { status: 201 });
	} catch (err) {
		if (isJobsError(err)) {
			return jsonApiError(err.code, err.message, err.status);
		}
		throw err;
	}
};
