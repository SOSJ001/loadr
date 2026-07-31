import {
	mockDriverJobStartedFragilePageData,
	mockDriverJobStartedPageData
} from '$lib/data/mock-driver-job-started';
import { requireDriverPage } from '$lib/server/auth';
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

	return {
		preview: false,
		freshStart,
		driverClientLoad: true as const
	};
};
