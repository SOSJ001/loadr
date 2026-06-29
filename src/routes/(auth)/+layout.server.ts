import { redirect } from '@sveltejs/kit';
import { resolvePostLoginPath } from '$lib/auth/redirects';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.session || !locals.profile) {
		return {};
	}

	if (url.pathname === '/login' || url.pathname === '/login/driver' || url.pathname === '/signup') {
		redirect(303, resolvePostLoginPath(locals.profile.role, url.searchParams.get('redirect')));
	}

	return {};
};
