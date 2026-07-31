import {
	loadDriverJobsPage,
	prefetchJobDetailsForList
} from '$lib/offline/driver-load';
import { browser } from '$app/environment';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, data, fetch }) => {
	if (!data.driverClientLoad || !browser) return {};

	const date = url.searchParams.get('date') ?? undefined;
	const { pageData, fromCache } = await loadDriverJobsPage(date, fetch);

	if (!fromCache) {
		void prefetchJobDetailsForList(pageData, fetch);
	}

	return { pageData, fromCache };
};
