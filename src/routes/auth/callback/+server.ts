import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** Handles Supabase PKCE redirects — email confirmation and password recovery. */
export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const next = url.searchParams.get('next');
	const type = url.searchParams.get('type');
	const isRecovery = next === '/reset-password' || type === 'recovery';

	const authError = url.searchParams.get('error');
	if (authError) {
		redirect(303, isRecovery ? '/reset-password?error=expired' : '/login?error=email_confirmation');
	}

	const code = url.searchParams.get('code');
	if (!code) {
		redirect(
			303,
			isRecovery ? '/reset-password?error=expired' : '/login?error=email_confirmation'
		);
	}

	const { data, error } = await supabase.auth.exchangeCodeForSession(code);
	if (error) {
		redirect(
			303,
			isRecovery ? '/reset-password?error=expired' : '/login?error=email_confirmation'
		);
	}

	if (isRecovery) {
		redirect(303, '/reset-password');
	}

	const confirmedEmail = data.user?.email ?? '';
	await supabase.auth.signOut();

	const params = new URLSearchParams({ confirmed: 'email' });
	if (confirmedEmail) {
		params.set('email', confirmedEmail);
	}

	redirect(303, `/login?${params.toString()}`);
};
