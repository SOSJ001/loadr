import { jsonApiError } from '$lib/server/api/response';
import { requireApiJobsAccess } from '$lib/server/auth';
import { isJobsError } from '$lib/server/jobs';
import { generatePodPdf } from '$lib/server/pod';
import type { RequestHandler } from './$types';

/** GET /api/v1/jobs/:id/pod/download — admin PDF export */
export const GET: RequestHandler = async (event) => {
	const auth = requireApiJobsAccess(event);
	if (auth instanceof Response) return auth;

	if (auth.role !== 'admin') {
		return jsonApiError('FORBIDDEN', 'Forbidden', 403);
	}

	try {
		const { bytes, filename } = await generatePodPdf(
			event.locals.supabase,
			auth,
			event.params.id
		);

		const body = Uint8Array.from(bytes);

		return new Response(body, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="${filename}"`
			}
		});
	} catch (err) {
		if (isJobsError(err)) {
			return jsonApiError(err.code, err.message, err.status);
		}
		throw err;
	}
};
