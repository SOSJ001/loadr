import { error, json } from '@sveltejs/kit';
import { jsonApiError } from '$lib/server/api/response';
import { requireApiJobsAccess, requireProfile } from '$lib/server/auth';
import {
	completeJobForDriver,
	deleteJobForUser,
	getJobForUser,
	isJobsError,
	startJobForDriver,
	updateJobForUser
} from '$lib/server/jobs';
import type { RequestHandler } from './$types';

function resolveApiProfileOrResponse(event: Parameters<RequestHandler>[0]) {
	const auth = requireApiJobsAccess(event);
	if (auth instanceof Response) return auth;
	return auth;
}

/** GET /api/v1/jobs/:id — API spec Group 4 Jobs */
export const GET: RequestHandler = async (event) => {
	const profile = resolveApiProfileOrResponse(event);
	if (profile instanceof Response) return profile;

	const job = await getJobForUser(event.locals.supabase, profile, event.params.id);
	if (!job) error(404, 'Not found');
	return json(job);
};

/** PATCH /api/v1/jobs/:id — API spec Group 4 Jobs */
export const PATCH: RequestHandler = async (event) => {
	const profile = resolveApiProfileOrResponse(event);
	if (profile instanceof Response) return profile;

	const body = await event.request.json();

	try {
		let job;

		if (profile.role === 'driver' && body.status === 'in_progress') {
			job = await startJobForDriver(event.locals.supabase, profile, event.params.id);
		} else if (profile.role === 'driver' && body.status === 'complete') {
			const completedAt =
				typeof body.completed_at === 'string' ? body.completed_at : undefined;
			job = await completeJobForDriver(
				event.locals.supabase,
				profile,
				event.params.id,
				completedAt
			);
		} else {
			job = await updateJobForUser(
				event.locals.supabase,
				profile,
				event.params.id,
				body
			);
		}

		if (!job) error(404, 'Not found');
		return json(job);
	} catch (err) {
		if (isJobsError(err)) {
			return jsonApiError(err.code, err.message, err.status);
		}
		throw err;
	}
};

/** DELETE /api/v1/jobs/:id — API spec Group 4 Jobs */
export const DELETE: RequestHandler = async (event) => {
	const profile = requireProfile(event);
	if (profile.role !== 'admin') error(404, 'Not found');

	try {
		const deleted = await deleteJobForUser(
			event.locals.supabase,
			profile,
			event.params.id
		);
		if (!deleted) error(404, 'Not found');
		return json({ ok: true });
	} catch (err) {
		if (isJobsError(err)) {
			return jsonApiError(err.code, err.message, err.status);
		}
		throw err;
	}
};
