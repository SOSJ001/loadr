import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		hasRecoverySession: Boolean(locals.session)
	};
};
