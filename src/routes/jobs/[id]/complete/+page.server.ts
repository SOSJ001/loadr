import { fail, redirect } from '@sveltejs/kit';
import {
	requireInProgressJobForDriver,
	toDriverJobFlowContext
} from '$lib/server/driver-job-flow';
import { requireDriverPage } from '$lib/server/auth';
import { isJobsError } from '$lib/server/jobs';
import { uploadPodForJob } from '$lib/server/pod';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireDriverPage(locals.profile);

	const job = await requireInProgressJobForDriver(
		locals.supabase,
		locals.profile!,
		params.id
	);

	return {
		job: toDriverJobFlowContext(job)
	};
};

export const actions: Actions = {
	default: async ({ locals, params, request }) => {
		requireDriverPage(locals.profile);

		await requireInProgressJobForDriver(locals.supabase, locals.profile!, params.id);

		const formData = await request.formData();

		try {
			await uploadPodForJob(locals.supabase, locals.profile!, params.id, formData);
		} catch (err) {
			if (isJobsError(err)) {
				return fail(err.status, { message: err.message });
			}
			throw err;
		}

		redirect(303, `/jobs/${params.id}`);
	}
};
