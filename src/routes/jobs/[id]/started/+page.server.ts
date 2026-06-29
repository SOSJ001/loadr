import {
	mockDriverJobStartedFragilePageData,
	mockDriverJobStartedPageData
} from '$lib/data/mock-driver-job-started';
import { requireDriverPage } from '$lib/server/auth';
import { requireInProgressJobForDriver } from '$lib/server/driver-job-flow';
import { buildDriverJobStartedPageDataForJob } from '$lib/server/driver-job-started';
import {
	isDriverJobStartedFragilePreview,
	isDriverJobStartedPreviewMode
} from '$lib/utils/driver-job-started-theme';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const preview = url.searchParams.get('preview');
	const freshStart = url.searchParams.get('fresh') === '1';

	if (params.id.startsWith('mock-') || isDriverJobStartedPreviewMode(preview)) {
		return {
			preview: true,
			freshStart: freshStart || isDriverJobStartedPreviewMode(preview),
			pageData: isDriverJobStartedFragilePreview(preview)
				? mockDriverJobStartedFragilePageData()
				: mockDriverJobStartedPageData()
		};
	}

	requireDriverPage(locals.profile);

	const job = await requireInProgressJobForDriver(
		locals.supabase,
		locals.profile!,
		params.id
	);

	const pageData = await buildDriverJobStartedPageDataForJob(locals.supabase, job);

	return {
		preview: false,
		freshStart,
		pageData
	};
};
