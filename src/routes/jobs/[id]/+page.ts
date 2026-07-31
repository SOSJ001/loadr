import { loadDriverJobDetail } from '$lib/offline/driver-load';
import { browser } from '$app/environment';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, data, fetch }) => {
	if (!data.driverClientLoad || !browser) return {};

	const { driverPageData, fromCache } = await loadDriverJobDetail(params.id, fetch);
	return { driverPageData, fromCache };
};
