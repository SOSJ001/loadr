import { error, redirect } from '@sveltejs/kit';
import { requireApiJobsAccess } from '$lib/server/auth';
import { getPodFileSignedUrl } from '$lib/server/pod';
import type { RequestHandler } from './$types';

/** GET /api/v1/jobs/:id/pod/file — redirect to short-lived signed URL for PoD image */
export const GET: RequestHandler = async (event) => {
	const auth = requireApiJobsAccess(event);
	if (auth instanceof Response) return auth;

	const signedUrl = await getPodFileSignedUrl(
		event.locals.supabase,
		auth,
		event.params.id
	);

	if (!signedUrl) {
		error(404, 'Not found');
	}

	redirect(302, signedUrl);
};
