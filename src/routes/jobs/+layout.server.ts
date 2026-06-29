import { redirect } from '@sveltejs/kit';
import { requireJobsAccess } from '$lib/server/auth';
import {
	isDriverJobDetailPreviewMode,
	resolveDriverJobDetailThemeHint
} from '$lib/utils/driver-job-detail-theme';
import {
	isDriverJobStartedPreviewMode,
	resolveDriverJobStartedThemeHint
} from '$lib/utils/driver-job-started-theme';
import {
	isDriverReportIssuePreviewMode,
	resolveDriverReportIssueThemeHint
} from '$lib/utils/driver-report-issue-theme';
import { isDriverJobsDarkOfflinePreview, isDriverJobsLightPreview, isDriverJobsPreviewMode } from '$lib/utils/driver-jobs-theme';
import type { LayoutServerLoad } from './$types';

const PREVIEW_DRIVER_PROFILE = {
	id: 'preview-driver',
	company_id: 'preview-company',
	full_name: 'James Okafor',
	email: 'james@preview.local',
	phone: null,
	role: 'driver' as const,
	status: 'active' as const,
	removed_at: null
};

/** Layer 3 — auth only. Data scoping happens in +page.server.ts via lib/server/jobs.ts */
export const load: LayoutServerLoad = async ({ locals, url }) => {
	const preview = url.searchParams.get('preview');

	if (
		isDriverJobsPreviewMode(preview) ||
		isDriverJobDetailPreviewMode(preview) ||
		isDriverJobStartedPreviewMode(preview) ||
		isDriverReportIssuePreviewMode(preview)
	) {
		const themeHint =
			isDriverJobsLightPreview(preview) ||
			resolveDriverJobDetailThemeHint(preview) === 'light' ||
			resolveDriverJobStartedThemeHint(preview) === 'light' ||
			resolveDriverReportIssueThemeHint(preview) === 'light'
				? ('light' as const)
				: isDriverJobsDarkOfflinePreview(preview) ||
					  resolveDriverJobDetailThemeHint(preview) === 'dark' ||
					  resolveDriverJobStartedThemeHint(preview) === 'dark' ||
					  resolveDriverReportIssueThemeHint(preview) === 'dark'
					? ('dark' as const)
					: null;

		return {
			profile: PREVIEW_DRIVER_PROFILE,
			role: 'driver' as const,
			companyName: "Dave's Couriers Ltd",
			plan: 'free' as const,
			jobsThemeHint: themeHint
		};
	}

	if (!locals.session) {
		redirect(303, `/login/driver?redirect=${encodeURIComponent(url.pathname)}`);
	}

	const profile = requireJobsAccess(locals.profile);

	let companyName = 'Your company';
	let plan = 'free';

	if (profile.company_id) {
		const { data: company } = await locals.supabase
			.from('companies')
			.select('name, plan')
			.eq('id', profile.company_id)
			.single();

		if (company) {
			companyName = company.name;
			plan = company.plan;
		}
	}

	return { profile, role: profile.role, companyName, plan, jobsThemeHint: null };
};
