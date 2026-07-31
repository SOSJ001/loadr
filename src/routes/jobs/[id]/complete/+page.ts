import { loadDriverJobFlow } from '$lib/offline/driver-load';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, data }) => {
	if (!data.driverClientLoad) return {};

	const { job, fromCache } = await loadDriverJobFlow(params.id);
	return { job, fromCache };
};
