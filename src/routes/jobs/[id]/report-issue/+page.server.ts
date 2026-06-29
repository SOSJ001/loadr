import { fail, redirect } from '@sveltejs/kit';
import { mockDriverReportIssueJob } from '$lib/data/mock-driver-report-issue';
import { requireDriverPage } from '$lib/server/auth';
import {
	fetchDriverReportIssuePageData,
	submitDriverReportIssue
} from '$lib/server/driver-report-issue';
import { isJobsError } from '$lib/server/jobs';
import { DRIVER_ISSUE_REASONS } from '$lib/types/driver-job-flow';
import {
	isDriverReportIssueFormPreviewMode,
	isDriverReportIssueSuccessPreview,
	reportIssuePreviewInitialNotes,
	reportIssuePreviewPhotoAttached,
	reportIssuePreviewSelectedReason
} from '$lib/utils/driver-report-issue-theme';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const preview = url.searchParams.get('preview');

	if (isDriverReportIssueSuccessPreview(preview)) {
		redirect(303, `/jobs/${params.id}/report-issue/success?preview=${preview}`);
	}

	if (params.id.startsWith('mock-') || isDriverReportIssueFormPreviewMode(preview)) {
		return {
			preview: true,
			job: mockDriverReportIssueJob(),
			reasons: DRIVER_ISSUE_REASONS,
			initialSelectedReason: reportIssuePreviewSelectedReason(preview),
			initialNotes: reportIssuePreviewInitialNotes(preview),
			initialPhotoAttached: reportIssuePreviewPhotoAttached(preview)
		};
	}

	requireDriverPage(locals.profile);

	const job = await fetchDriverReportIssuePageData(
		locals.supabase,
		locals.profile!,
		params.id
	);

	return {
		preview: false,
		job,
		reasons: DRIVER_ISSUE_REASONS,
		initialSelectedReason: '',
		initialNotes: '',
		initialPhotoAttached: false
	};
};

export const actions: Actions = {
	default: async ({ locals, params, request }) => {
		requireDriverPage(locals.profile);

		const formData = await request.formData();

		try {
			await submitDriverReportIssue(
				locals.supabase,
				locals.profile!,
				params.id,
				formData
			);
		} catch (err) {
			if (isJobsError(err)) {
				return fail(err.status, { message: err.message });
			}
			throw err;
		}

		redirect(303, `/jobs/${params.id}/report-issue/success`);
	}
};
