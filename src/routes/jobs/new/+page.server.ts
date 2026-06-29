import { fail } from '@sveltejs/kit';
import { requireAdminPage, requireJobsAccess } from '$lib/server/auth';
import { JobsError, createJobForUser } from '$lib/server/jobs';
import { listAssignableDriversForCompany } from '$lib/server/users';
import {
	combineScheduledAt,
	createJobSeedFromSubmission,
	isCreateJobSubmissionValid,
	parseCreateJobFormData,
	resolveCreateJobSeed
} from '$lib/utils/operator-create-job';
import { isCreateJobDiscardPreview } from '$lib/utils/operator-preview';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const profile = requireJobsAccess(locals.profile);
	requireAdminPage(profile);

	const preview = url.searchParams.get('preview');
	const driverRows = await listAssignableDriversForCompany(locals.supabase, profile);
	const drivers = driverRows.map((driver) => ({
		id: driver.id,
		full_name: driver.full_name
	}));

	return {
		drivers,
		seed: resolveCreateJobSeed(preview, drivers),
		forceValidation: preview === 'errors',
		showDiscardModal: isCreateJobDiscardPreview(preview)
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
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
			const job = await createJobForUser(locals.supabase, profile, {
				pickup_address: parsed.pickupAddress,
				pickup_lat: parsed.pickupLat,
				pickup_lng: parsed.pickupLng,
				dropoff_address: parsed.dropoffAddress,
				dropoff_lat: parsed.dropoffLat,
				dropoff_lng: parsed.dropoffLng,
				scheduled_at: combineScheduledAt(parsed.scheduleDate, parsed.scheduleTime),
				assigned_driver_id: parsed.assignedDriverId,
				notes: parsed.notes || null,
				status: 'pending'
			});

			return {
				success: true,
				job: {
					id: job.id,
					reference: job.reference.startsWith('#') ? job.reference : `#${job.reference}`
				}
			};
		} catch (error) {
			if (error instanceof JobsError) {
				return fail(error.status, { message: error.message, seed });
			}

			throw error;
		}
	}
};
