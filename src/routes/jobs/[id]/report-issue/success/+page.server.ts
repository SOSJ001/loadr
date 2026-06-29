import { error, redirect } from '@sveltejs/kit';
import { mockDriverReportIssueJob } from '$lib/data/mock-driver-report-issue';
import { requireDriverPage } from '$lib/server/auth';
import { fetchDriverReportIssueSuccessPageData } from '$lib/server/driver-report-issue';
import { getJobForUser } from '$lib/server/jobs';
import { isDriverReportIssueSuccessPreview } from '$lib/utils/driver-report-issue-theme';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const preview = url.searchParams.get('preview');

	if (params.id.startsWith('mock-') || isDriverReportIssueSuccessPreview(preview)) {
		return {
			preview: true,
			job: mockDriverReportIssueJob()
		};
	}

	requireDriverPage(locals.profile);

	const job = await fetchDriverReportIssueSuccessPageData(
		locals.supabase,
		locals.profile!,
		params.id
	);

	if (job) {
		return { preview: false, job };
	}

	const existing = await getJobForUser(locals.supabase, locals.profile!, params.id);
	if (!existing) {
		error(404, 'Not found');
	}

	redirect(
		303,
		existing.status === 'in_progress'
			? `/jobs/${params.id}/report-issue`
			: `/jobs/${params.id}`
	);
};
