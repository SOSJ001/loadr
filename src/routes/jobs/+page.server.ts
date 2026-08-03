import { requireJobsAccess } from '$lib/server/auth';
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
		// Operator jobs data loads in +page.ts (universal) — page.server fields were not reaching page.data
		return {
			profile,
			preview: false
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
