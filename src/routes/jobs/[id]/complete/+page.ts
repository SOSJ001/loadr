import { loadDriverJobFlow } from '$lib/offline/driver-load';
import { browser } from '$app/environment';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, data, fetch }) => {
	if (!data.driverClientLoad || !browser) return {};

	const { job, fromCache } = await loadDriverJobFlow(params.id, fetch);
	return { job, fromCache };
};
