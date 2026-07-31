import {
	loadDriverJobsPage,
	prefetchJobDetailsForList
} from '$lib/offline/driver-load';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, data }) => {
	if (!data.driverClientLoad) return {};

	const date = url.searchParams.get('date') ?? undefined;
	const { pageData, fromCache } = await loadDriverJobsPage(date);

	if (!fromCache) {
		void prefetchJobDetailsForList(pageData);
	}

	return { pageData, fromCache };
};
