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
			error(response.status, 'Failed to load job');
		}

		const { pageData } = (await response.json()) as { pageData: unknown };

		return { preview: false, pageData };
	}

	if (!data.driverClientLoad || !browser) return {};

	const { driverPageData, fromCache } = await loadDriverJobDetail(params.id, fetch);
	return { driverPageData, fromCache };
};
