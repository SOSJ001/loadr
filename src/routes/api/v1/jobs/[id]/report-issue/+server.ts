import { error, json } from '@sveltejs/kit';
import { jsonApiError } from '$lib/server/api/response';
import { requireApiJobsAccess } from '$lib/server/auth';
import { submitDriverReportIssue } from '$lib/server/driver-report-issue';
import { isJobsError, getJobForUser } from '$lib/server/jobs';
import type { RequestHandler } from './$types';

/** POST /api/v1/jobs/:id/report-issue — offline replay + native clients */
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
		const updated = await submitDriverReportIssue(
			event.locals.supabase,
			auth,
			event.params.id,
			formData
		);
		return json(updated);
	} catch (err) {
		if (isJobsError(err)) {
			return jsonApiError(err.code, err.message, err.status);
		}
		throw err;
	}
};
