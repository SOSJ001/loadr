import { redirect } from '@sveltejs/kit';
import { logoutWithSession } from '$lib/server/auth-api';

export async function driverLogoutAction(locals: App.Locals): Promise<never> {
	await logoutWithSession(locals.supabase);
	redirect(303, '/login/driver');
}
