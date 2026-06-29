import { error, fail, redirect } from '@sveltejs/kit';
import {
	getMockDriverProfileForId,
	getMockDriverProfileFree,
	getMockDriverProfilePaid,
	getMockDriverProfilePending
} from '$lib/data/mock-driver-profile';
import { fetchDriverProfileData } from '$lib/server/driver-profile';
import { isUsersError, removeDriver, resendInvite } from '$lib/server/users';
import type { Actions, PageServerLoad } from './$types';

function isPreviewMode(preview: string | null): boolean {
	return (
		preview === 'free' ||
		preview === 'pending' ||
		preview === 'paid' ||
		preview === 'pro' ||
		preview === 'dark' ||
		preview === 'remove-modal' ||
		preview === 'remove' ||
		preview === 'filtered' ||
		preview === 'filter-complete'
	);
}

export const load: PageServerLoad = async ({ params, url, locals, parent }) => {
	const preview = url.searchParams.get('preview');

	if (preview === 'free') {
		return { profile: getMockDriverProfileFree(), mockResend: true };
	}

	if (preview === 'pending') {
		return {
			profile: {
				...getMockDriverProfilePending(),
				invite_link: `${url.origin}/activate?token=preview-token`
			},
			mockResend: true
		};
	}

	if (preview === 'paid' || preview === 'pro' || preview === 'dark') {
		return { profile: getMockDriverProfilePaid(), mockResend: true };
	}

	if (preview === 'remove-modal' || preview === 'remove') {
		return {
			profile: getMockDriverProfilePaid(),
			removeModalOpen: true,
			mockResend: true
		};
	}

	if (preview === 'filtered' || preview === 'filter-complete') {
		return {
			profile: getMockDriverProfilePaid(),
			jobsTab: 'complete' as const,
			mockResend: true
		};
	}

	if (params.id.startsWith('mock-driver-')) {
		const mockProfile = getMockDriverProfileForId(params.id);
		return {
			profile: mockProfile
				? {
						...mockProfile,
						invite_link:
							mockProfile.driver.status === 'pending'
								? `${url.origin}/activate?token=preview-token`
								: null
					}
				: null,
			mockResend: true
		};
	}

	const profile = locals.profile;
	if (!profile || profile.role !== 'admin') {
		error(403, 'Forbidden');
	}

	const parentData = await parent();
	const plan = parentData.plan === 'pro' ? 'pro' : 'free';

	const driverProfile = await fetchDriverProfileData(
		locals.supabase,
		profile,
		params.id,
		plan,
		url.origin
	);

	return {
		profile: driverProfile,
		mockResend: false
	};
};

export const actions = {
	resend: async ({ locals, params, url }) => {
		if (isPreviewMode(url.searchParams.get('preview')) || params.id.startsWith('mock-driver-')) {
			return fail(400, { message: 'Resend is disabled in UI preview mode.' });
		}

		const profile = locals.profile;
		if (!profile || profile.role !== 'admin') {
			return fail(403, { message: 'Forbidden' });
		}

		try {
			const driver = await resendInvite(
				locals.supabase,
				profile,
				params.id,
				url.origin
			);

			if (!driver) {
				return fail(404, { message: 'Driver not found.' });
			}

			return { resendSuccess: true, driverName: driver.full_name };
		} catch (err) {
			if (isUsersError(err)) {
				return fail(err.status, { message: err.message });
			}
			throw err;
		}
	},

	remove: async ({ locals, params, url, request }) => {
		if (isPreviewMode(url.searchParams.get('preview')) || params.id.startsWith('mock-driver-')) {
			return fail(400, { message: 'Remove is disabled in UI preview mode.' });
		}

		const profile = locals.profile;
		if (!profile || profile.role !== 'admin') {
			return fail(403, { message: 'Forbidden' });
		}

		const formData = await request.formData();
		const confirmText = String(formData.get('confirm_text') ?? '').trim();

		try {
			const removed = await removeDriver(locals.supabase, profile, params.id, confirmText);

			if (!removed) {
				return fail(404, { message: 'Driver not found.' });
			}

			redirect(303, '/drivers');
		} catch (err) {
			if (isUsersError(err)) {
				return fail(err.status, { message: err.message });
			}
			throw err;
		}
	}
} satisfies Actions;
