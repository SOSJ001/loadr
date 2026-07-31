import { mockDriverReportIssueJob } from '$lib/data/mock-driver-report-issue';
import { requireDriverPage } from '$lib/server/auth';
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

	return {
		preview: false,
		driverClientLoad: true as const
	};
};
