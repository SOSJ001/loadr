import { error } from '@sveltejs/kit';
import { browser } from '$app/environment';
import {
	getMockOperatorJobsEmpty,
	getMockOperatorJobsPopulated
} from '$lib/data/mock-operator-jobs';
import { loadDriverJobsPage, prefetchJobDetailsForList } from '$lib/offline/driver-load';
import type { PageLoad } from './$types';

function isOperatorJobsPreviewEmpty(preview: string | null): boolean {
	return preview === 'empty';
}

function isOperatorJobsPreviewPopulated(preview: string | null): boolean {
	return preview === 'populated' || preview === 'dark';
}

export const load: PageLoad = async ({ url, data, fetch }) => {
	const preview = url.searchParams.get('preview');

	if (data.profile?.role === 'admin') {
		if (isOperatorJobsPreviewPopulated(preview)) {
			return { preview: true, ...getMockOperatorJobsPopulated() };
		}

		if (isOperatorJobsPreviewEmpty(preview)) {
			return { preview: true, ...getMockOperatorJobsEmpty() };
		}

		const response = await fetch('/api/v1/jobs/operator-page');
		if (!response.ok) {
			error(response.status, 'Failed to load jobs');
		}

		const operatorData = (await response.json()) as {
			jobs: unknown[];
			stats: unknown;
			drivers: unknown[];
		};

		// #region agent log
		fetch('http://127.0.0.1:7339/ingest/beb9541b-9fab-4328-8b18-a7b052a2e513', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f82c8b' },
			body: JSON.stringify({
				sessionId: 'f82c8b',
				runId: 'regression-v1',
				hypothesisId: 'H2-H5',
				location: 'jobs/+page.ts:admin-api',
				message: 'admin api load',
				data: {
					browser,
					jobsCount: operatorData.jobs.length,
					driversCount: operatorData.drivers.length,
					status: response.status
				},
				timestamp: Date.now()
			})
		}).catch(() => {});
		// #endregion

		return { preview: false, ...operatorData };
	}

	if (!data.driverClientLoad || !browser) return {};

	const date = url.searchParams.get('date') ?? undefined;
	const { pageData, fromCache } = await loadDriverJobsPage(date, fetch);

	if (!fromCache) {
		void prefetchJobDetailsForList(pageData, fetch);
	}

	return { pageData, fromCache };
};
