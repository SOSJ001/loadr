import { fail, redirect } from '@sveltejs/kit';
import { loginWithEmail } from '$lib/server/auth-api';
import {
	activateDriver,
	getDriverInvitePreview,
	isUsersError
} from '$lib/server/users';
import {
	ACTIVATE_ERRORS_PREVIEW_FIELD_ERRORS,
	ACTIVATE_TYPING_PREVIEW_PASSWORD,
	isActivateErrorsPreview,
	isActivateInstallPreview,
	isActivateLightInstallPreview,
	isActivateLightSetupPreview,
	isActivatePreviewMode,
	isActivateSuccessPreview,
	isActivateTypingPreview,
	resolveActivateStep
} from '$lib/utils/driver-activate-theme';
import type { Actions, PageServerLoad } from './$types';

const MOCK_EXPIRES_AT = new Date(Date.now() + 47 * 3_600_000 + 32 * 60_000 + 18_000).toISOString();

function mockInvite() {
	return {
		companyName: "Dave's Couriers Ltd",
		inviteExpiresAt: MOCK_EXPIRES_AT,
		fullName: 'James Okafor'
	};
}

export const load: PageServerLoad = async ({ url, locals }) => {
	const preview = url.searchParams.get('preview');
	const token = url.searchParams.get('token')?.trim() ?? '';
	const step = resolveActivateStep(url, preview);

	if (isActivatePreviewMode(preview)) {
		const typingPreview = isActivateTypingPreview(preview);
		const errorsPreview = isActivateErrorsPreview(preview);
		const successPreview = isActivateSuccessPreview(preview);
		const invite = mockInvite();

		return {
			step,
			preview: true,
			activateThemeHint: isActivateLightInstallPreview(preview)
				? ('light' as const)
				: isActivateInstallPreview(preview)
					? ('dark' as const)
					: isActivateLightSetupPreview(preview)
						? ('light' as const)
						: null,
			setupPreview: typingPreview
				? ('typing' as const)
				: errorsPreview
					? ('errors' as const)
					: null,
			setupPasswordSeed: typingPreview ? ACTIVATE_TYPING_PREVIEW_PASSWORD : null,
			setupFieldErrors: errorsPreview ? { ...ACTIVATE_ERRORS_PREVIEW_FIELD_ERRORS } : null,
			setupAttempted: errorsPreview,
			driverName: invite.fullName,
			token: token || 'preview-token',
			invite: successPreview ? null : invite,
			error: null
		};
	}

	if (step === 'success') {
		if (!locals.session || locals.profile?.role !== 'driver') {
			redirect(303, '/login/driver');
		}

		return {
			step,
			preview: false,
			activateThemeHint: null,
			setupPreview: null,
			setupPasswordSeed: null,
			setupFieldErrors: null,
			setupAttempted: false,
			driverName: locals.profile.full_name,
			token: '',
			invite: null,
			error: null
		};
	}

	if (!token) {
		return {
			step,
			preview: false,
			activateThemeHint: null,
			setupPreview: null,
			setupPasswordSeed: null,
			setupFieldErrors: null,
			setupAttempted: false,
			driverName: null,
			token: '',
			invite: null,
			error: 'invalid' as const
		};
	}

	try {
		const invite = await getDriverInvitePreview(token);

		if (!invite) {
			return {
				step,
				preview: false,
				activateThemeHint: null,
				setupPreview: null,
				setupPasswordSeed: null,
				setupFieldErrors: null,
				setupAttempted: false,
				driverName: null,
				token,
				invite: null,
				error: 'invalid' as const
			};
		}

		if (invite.inviteExpiresAt && new Date(invite.inviteExpiresAt) < new Date()) {
			return {
				step,
				preview: false,
				activateThemeHint: null,
				setupPreview: null,
				setupPasswordSeed: null,
				setupFieldErrors: null,
				setupAttempted: false,
				driverName: null,
				token,
				invite,
				error: 'expired' as const
			};
		}

		return {
			step,
			preview: false,
			activateThemeHint: step === 'install' ? ('dark' as const) : null,
			setupPreview: null,
			setupPasswordSeed: null,
			setupFieldErrors: null,
			setupAttempted: false,
			driverName: invite.fullName,
			token,
			invite,
			error: null
		};
	} catch (err) {
		if (isUsersError(err) && err.message.includes('already active')) {
			return {
				step,
				preview: false,
				activateThemeHint: null,
				setupPreview: null,
				setupPasswordSeed: null,
				setupFieldErrors: null,
				setupAttempted: false,
				driverName: null,
				token,
				invite: null,
				error: 'active' as const
			};
		}
		throw err;
	}
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		if (isActivatePreviewMode(url.searchParams.get('preview'))) {
			return fail(400, { error: 'Activation is disabled in UI preview mode.' });
		}

		const form = await request.formData();
		const token = String(form.get('token') ?? url.searchParams.get('token') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const confirmPassword = String(form.get('confirm_password') ?? '');

		if (!token) {
			return fail(400, { error: 'Activation link is invalid or missing a token.' });
		}

		if (!password) {
			return fail(400, { error: 'Password is required', token });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match', token });
		}

		try {
			const { email } = await activateDriver(token, password);
			await loginWithEmail(locals.supabase, { email, password });
		} catch (err) {
			if (isUsersError(err)) {
				return fail(err.status, { error: err.message, token });
			}
			return fail(401, {
				error: 'Activation failed. Please try again or request a new invite.',
				token
			});
		}

		redirect(303, '/activate?step=success');
	}
};
