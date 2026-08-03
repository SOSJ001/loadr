import { error } from '@sveltejs/kit';
import { browser } from '$app/environment';
import {
	applyJobDetailPlanFeatures,
	getMockOperatorJobDetail,
	resolveMockOperatorJobDetailVariant
} from '$lib/data/mock-operator-job-detail';
import { loadDriverJobDetail } from '$lib/offline/driver-load';
import type { PageLoad } from './$types';

function resolveRole(
	data: Record<string, unknown>,
	parentData: Record<string, unknown>
): string {
	const profile = data.profile;
	if (profile && typeof profile === 'object' && 'role' in profile) {
		return String((profile as { role?: string }).role ?? '');
	}

	const parentProfile = parentData.profile;
	if (parentProfile && typeof parentProfile === 'object' && 'role' in parentProfile) {
		return String((parentProfile as { role?: string }).role ?? '');
	}

	if (typeof data.role === 'string') return data.role;
	if (typeof parentData.role === 'string') return parentData.role;
	return '';
}

export const load: PageLoad = async ({ params, data, fetch, url, parent }) => {
	const parentData = (await parent()) as Record<string, unknown>;
	const preview = url.searchParams.get('preview');
	const role = resolveRole(data as Record<string, unknown>, parentData);

	// #region agent log
	fetch('http://127.0.0.1:7339/ingest/beb9541b-9fab-4328-8b18-a7b052a2e513', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f82c8b' },
		body: JSON.stringify({
			sessionId: 'f82c8b',
			runId: 'job-detail-v2',
			hypothesisId: 'H5-H6',
			location: 'jobs/[id]/+page.ts:entry',
			message: 'universal load entry',
			data: {
				browser,
				jobId: params.id,
				role,
				dataKeys: Object.keys(data as object),
				parentKeys: Object.keys(parentData)
			},
			timestamp: Date.now()
		})
	}).catch(() => {});
	// #endregion

	if (role === 'admin') {
		if (params.id.startsWith('mock-')) {
			const variant = resolveMockOperatorJobDetailVariant(params.id, preview);
			const pageData = applyJobDetailPlanFeatures(
				getMockOperatorJobDetail(params.id, variant),
				String(parentData.plan ?? 'free'),
				preview
			);

			return { preview: true, pageData };
		}

		const query = preview ? `?preview=${encodeURIComponent(preview)}` : '';
		const response = await fetch(`/api/v1/jobs/operator-detail/${params.id}${query}`);
		if (!response.ok) {
			// #region agent log
			fetch('http://127.0.0.1:7339/ingest/beb9541b-9fab-4328-8b18-a7b052a2e513', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f82c8b' },
				body: JSON.stringify({
					sessionId: 'f82c8b',
					runId: 'job-detail-v2',
					hypothesisId: 'H7',
					location: 'jobs/[id]/+page.ts:admin-api-fail',
					message: 'admin job detail api failed',
					data: { browser, jobId: params.id, status: response.status },
					timestamp: Date.now()
				})
			}).catch(() => {});
			// #endregion
			error(response.status, 'Failed to load job');
		}

		const { pageData } = (await response.json()) as { pageData: unknown };

		// #region agent log
		fetch('http://127.0.0.1:7339/ingest/beb9541b-9fab-4328-8b18-a7b052a2e513', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f82c8b' },
			body: JSON.stringify({
				sessionId: 'f82c8b',
				runId: 'job-detail-v2',
				hypothesisId: 'H1-H2',
				location: 'jobs/[id]/+page.ts:admin-api',
				message: 'admin job detail api load',
				data: {
					browser,
					jobId: params.id,
					status: response.status,
					hasPageData: pageData != null
				},
				timestamp: Date.now()
			})
		}).catch(() => {});
		// #endregion

		return { preview: false, pageData };
	}

	if (!data.driverClientLoad || !browser) return {};

	const { driverPageData, fromCache } = await loadDriverJobDetail(params.id, fetch);
	return { driverPageData, fromCache };
};
