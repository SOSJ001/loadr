import { loadDriverJobDetail } from '$lib/offline/driver-load';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, data }) => {
	if (!data.driverClientLoad) return {};

	const { driverPageData, fromCache } = await loadDriverJobDetail(params.id);
	return { driverPageData, fromCache };
};
