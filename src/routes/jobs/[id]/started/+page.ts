import { loadDriverJobStarted } from '$lib/offline/driver-load';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, data }) => {
	if (!data.driverClientLoad) return {};

	const { pageData, fromCache } = await loadDriverJobStarted(params.id);
	return { pageData, fromCache };
};
