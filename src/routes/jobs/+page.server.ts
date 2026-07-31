import { requireJobsAccess } from '$lib/server/auth';
import {
	getMockOperatorJobsEmpty,
	getMockOperatorJobsPopulated
} from '$lib/data/mock-operator-jobs';
import { buildOperatorJobsPageData } from '$lib/server/operator-jobs';
import type { UserProfile } from '$lib/types/user';
import { mockDriverJobsPageDataForPreview } from '$lib/utils/driver-jobs-mock';
import { isDriverJobsPreviewMode } from '$lib/utils/driver-jobs-theme';
import type { PageServerLoad } from './$types';

const PREVIEW_DRIVER_PROFILE: UserProfile = {
	id: 'preview-driver',
	company_id: 'preview-company',
	full_name: 'James Okafor',
	email: 'james@preview.local',
	phone: null,
	role: 'driver',
	status: 'active',
	removed_at: null
};

function isOperatorJobsPreviewEmpty(preview: string | null): boolean {
	return preview === 'empty';
}

function isOperatorJobsPreviewPopulated(preview: string | null): boolean {
	return preview === 'populated' || preview === 'dark';
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const preview = url.searchParams.get('preview');

	if (isDriverJobsPreviewMode(preview)) {
		return {
			jobs: [],
			profile: PREVIEW_DRIVER_PROFILE,
			preview: true,
			pageData: mockDriverJobsPageDataForPreview(preview)
		};
	}

	const profile = requireJobsAccess(locals.profile);

	if (profile.role === 'admin') {
		if (isOperatorJobsPreviewPopulated(preview)) {
			return {
				profile,
				preview: true,
				pageData: getMockOperatorJobsPopulated()
			};
		}

		if (isOperatorJobsPreviewEmpty(preview)) {
			return {
				profile,
				preview: true,
				pageData: getMockOperatorJobsEmpty()
			};
		}

		// Live operator jobs list from Supabase
		const pageData = await buildOperatorJobsPageData(locals.supabase, profile);

		return {
			profile,
			preview: false,
			pageData
		};
	}

	// Driver live data loads client-side (+page.ts) for offline cache support.
	return {
		jobs: [],
		profile,
		preview: false,
		driverClientLoad: true as const
	};
};
