import { redirect } from '@sveltejs/kit';
import { isRemovedDriver } from '$lib/server/profile';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const isActivate = url.pathname === '/activate';

	if (isActivate) {
		return {
			session: locals.session,
			profile: locals.profile,
			isActivate: true as const
		};
	}

	if (!locals.session) {
		redirect(303, `/login/driver?redirect=${encodeURIComponent(url.pathname)}`);
	}

	if (locals.profile && isRemovedDriver(locals.profile)) {
		redirect(303, '/login/driver');
	}

	if (locals.profile?.role !== 'driver') {
		redirect(303, '/login/driver');
	}

	return {
		session: locals.session,
		profile: locals.profile,
		isActivate: false as const
	};
};
