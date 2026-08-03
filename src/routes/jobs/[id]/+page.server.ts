import { fail, redirect } from '@sveltejs/kit';
import { mockDriverJobDetailAttempted, mockDriverJobDetailComplete, mockDriverJobDetailInProgress, mockDriverJobDetailPending } from '$lib/data/mock-driver-job-detail';
import { requireDriverPage, requireJobsAccess } from '$lib/server/auth';
import { isJobsError, startJobForDriver } from '$lib/server/jobs';
import { isDriverJobDetailPreviewMode } from '$lib/utils/driver-job-detail-theme';
import type { Actions, PageServerLoad } from './$types';

function mockDriverJobDetailForPreview(preview: string | null) {
	if (preview === '5d' || preview === 'attempted') {
		return mockDriverJobDetailAttempted();
	}
	if (preview === '5c' || preview === 'complete') {
		return mockDriverJobDetailComplete();
	}
	if (preview === '5b' || preview === '5e' || preview === 'in_progress' || preview === 'light-in-progress') {
		return mockDriverJobDetailInProgress();
	}
	return mockDriverJobDetailPending();
}

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const profile = requireJobsAccess(locals.profile);
	const preview = url.searchParams.get('preview');

	if (profile.role === 'admin') {
		// Operator job detail loads in +page.ts (universal) — page.server fields were not reaching page.data
		return {
			profile,
			preview: false
		};
	}

	if (params.id.startsWith('mock-') || isDriverJobDetailPreviewMode(preview)) {
		return {
			profile,
			preview: true,
			driverPageData: mockDriverJobDetailForPreview(preview)
		};
	}

	return {
		profile,
		preview: false,
		driverClientLoad: true as const
	};
};

export const actions: Actions = {
	startJob: async ({ locals, params }) => {
		requireDriverPage(locals.profile);

		try {
			const job = await startJobForDriver(locals.supabase, locals.profile!, params.id);
			if (!job) {
				return fail(404, { message: 'Job not found' });
			}
		} catch (err) {
			if (isJobsError(err)) {
				return fail(err.status, { message: err.message });
			}
			throw err;
		}

		redirect(303, `/jobs/${params.id}/started?fresh=1`);
	}
};
