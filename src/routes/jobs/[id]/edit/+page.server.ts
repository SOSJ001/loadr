import { error, fail, redirect } from '@sveltejs/kit';
import { requireAdminPage, requireJobsAccess } from '$lib/server/auth';
import { JobsError, deleteJobForUser, getJobForUser, updateAdminJobDetails } from '$lib/server/jobs';
import { buildEditJobDriverOptions } from '$lib/server/operator-edit-job';
import {
	combineScheduledAt,
	createJobSeedFromSubmission,
	isCreateJobSubmissionValid,
	parseCreateJobFormData
} from '$lib/utils/operator-create-job';
import {
	formatEditJobReference,
	jobToEditFormSeed
} from '$lib/utils/operator-edit-job';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const profile = requireJobsAccess(locals.profile);
	requireAdminPage(profile);

	const job = await getJobForUser(locals.supabase, profile, params.id);
	if (!job) {
		error(404, 'Not found');
	}

	const drivers = await buildEditJobDriverOptions(
		locals.supabase,
		profile,
		job.assigned_driver_id
	);

	return {
		jobId: job.id,
		reference: formatEditJobReference(job.reference),
		status: job.status,
		drivers,
		seed: jobToEditFormSeed(job)
	};
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		const profile = requireJobsAccess(locals.profile);
		requireAdminPage(profile);

		const formData = await request.formData();
		const parsed = parseCreateJobFormData(formData);
		const seed = createJobSeedFromSubmission(parsed);

		if (!isCreateJobSubmissionValid(parsed)) {
			return fail(400, {
				message: 'Please complete all required fields and select addresses from the suggestions.',
				seed
			});
		}

		try {
			const job = await updateAdminJobDetails(locals.supabase, profile, params.id, {
				pickup_address: parsed.pickupAddress,
				pickup_lat: parsed.pickupLat,
				pickup_lng: parsed.pickupLng,
				dropoff_address: parsed.dropoffAddress,
				dropoff_lat: parsed.dropoffLat,
				dropoff_lng: parsed.dropoffLng,
				scheduled_at: combineScheduledAt(parsed.scheduleDate, parsed.scheduleTime),
				assigned_driver_id: parsed.assignedDriverId,
				notes: parsed.notes || null
			});

			if (!job) {
				return fail(404, { message: 'Job not found', seed });
			}

			redirect(303, `/jobs/${job.id}`);
		} catch (err) {
			if (err instanceof JobsError) {
				return fail(err.status, {
					message: err.message,
					seed
				});
			}

			throw err;
		}
	},

	delete: async ({ locals, params }) => {
		const profile = requireJobsAccess(locals.profile);
		requireAdminPage(profile);

		const job = await getJobForUser(locals.supabase, profile, params.id);
		const seed = job ? jobToEditFormSeed(job) : undefined;

		try {
			const deleted = await deleteJobForUser(locals.supabase, profile, params.id);
			if (!deleted) {
				return fail(404, { message: 'Job not found', seed });
			}

			redirect(303, '/jobs');
		} catch (err) {
			if (err instanceof JobsError) {
				return fail(err.status, { message: err.message, seed });
			}

			throw err;
		}
	}
};
