import { error, fail, redirect } from '@sveltejs/kit';
import {
	applyJobDetailPlanFeatures,
	getMockOperatorJobDetail,
	resolveMockOperatorJobDetailVariant
} from '$lib/data/mock-operator-job-detail';
import { mockDriverJobDetailAttempted, mockDriverJobDetailComplete, mockDriverJobDetailInProgress, mockDriverJobDetailPending } from '$lib/data/mock-driver-job-detail';
import { requireDriverPage, requireJobsAccess } from '$lib/server/auth';
import { fetchDriverJobDetailPageData } from '$lib/server/driver-job-detail';
import { isJobsError, startJobForDriver } from '$lib/server/jobs';
import { fetchOperatorJobDetailPageData } from '$lib/server/operator-job-detail';
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

export const load: PageServerLoad = async ({ locals, params, url, parent }) => {
	const profile = requireJobsAccess(locals.profile);
	const { plan } = await parent();
	const preview = url.searchParams.get('preview');

	if (profile.role === 'admin' && params.id.startsWith('mock-')) {
		const variant = resolveMockOperatorJobDetailVariant(params.id, preview);
		const pageData = applyJobDetailPlanFeatures(
			getMockOperatorJobDetail(params.id, variant),
			plan,
			preview
		);

		return {
			profile,
			preview: true,
			pageData
		};
	}

	if (profile.role === 'admin') {
		const pageData = await fetchOperatorJobDetailPageData(
			locals.supabase,
			profile,
			params.id,
			plan,
			preview
		);

		if (!pageData) {
			error(404, 'Not found');
		}

		return {
			profile,
			preview: false,
			pageData
		};
	}

	if (params.id.startsWith('mock-') || isDriverJobDetailPreviewMode(preview)) {
		return {
			profile,
			preview: true,
			driverPageData: mockDriverJobDetailForPreview(preview)
		};
	}

	const driverPageData = await fetchDriverJobDetailPageData(
		locals.supabase,
		profile,
		params.id
	);

	if (!driverPageData) {
		error(404, 'Not found');
	}

	return { profile, preview: false, driverPageData };
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
