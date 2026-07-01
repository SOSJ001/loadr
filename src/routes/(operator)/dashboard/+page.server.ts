import {
	getMockDashboardActive,
	getMockDashboardPendingVerification
} from '$lib/data/mock-dashboard';
import { loadDashboardData } from '$lib/server/dashboard';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const preview = url.searchParams.get('preview');

	if (preview === 'loading' || preview === 'loading-dark') {
		return {
			stats: { pending: 0, inProgress: 0, completedToday: 0 },
			recentJobs: [],
			showOnboardingBanner: false,
			showPendingVerificationBanner: false,
			hoverPreviewJobId: null
		};
	}

	if (preview === 'pending-verification') {
		return getMockDashboardPendingVerification();
	}

	if (preview === 'active' || preview === 'hover') {
		const data = getMockDashboardActive();
		if (preview === 'hover') {
			return {
				...data,
				hoverPreviewJobId: data.recentJobs[0]?.id ?? null
			};
		}
		return data;
	}

	if (!locals.profile) {
		return {
			stats: { pending: 0, inProgress: 0, completedToday: 0 },
			recentJobs: [],
			showOnboardingBanner: true,
			showPendingVerificationBanner: false,
			hoverPreviewJobId: null
		};
	}

	try {
		return {
			...(await loadDashboardData(locals.supabase, locals.profile)),
			hoverPreviewJobId: null
		};
	} catch (err) {
		console.error('[loadr] dashboard load failed:', err);
		throw err;
	}
};
