import { error, fail } from '@sveltejs/kit';
import { buildDriversPageData, fetchDriverListJobStats } from '$lib/server/driver-list';
import { buildDriverActivateUrl } from '$lib/utils/driver-invite';
import {
	getMockDriversActive,
	getMockDriversAtLimit,
	getMockDriversEmpty,
	getMockDriversPanelSuccess
} from '$lib/data/mock-drivers';
import {
	inviteDriver,
	isUsersError,
	listDriversForCompany,
	resendInvite
} from '$lib/server/users';
import type { Actions, PageServerLoad } from './$types';

function isPreviewMode(preview: string | null): boolean {
	return (
		preview === 'at-limit' ||
		preview === 'empty' ||
		preview === 'panel-success' ||
		preview === 'panel-open' ||
		preview === 'dark'
	);
}

export const load: PageServerLoad = async ({ url, locals, parent }) => {
	const preview = url.searchParams.get('preview');

	if (preview === 'at-limit') {
		return { ...getMockDriversAtLimit(), mockInvite: true };
	}

	if (preview === 'empty') {
		return { ...getMockDriversEmpty(), mockInvite: true };
	}

	if (preview === 'panel-success') {
		return { ...getMockDriversPanelSuccess(), mockInvite: true };
	}

	if (preview === 'panel-open') {
		return { ...getMockDriversActive(), panelOpen: true, mockInvite: true };
	}

	if (preview === 'dark') {
		return { ...getMockDriversActive(), mockInvite: true };
	}

	const profile = locals.profile;
	if (!profile || profile.role !== 'admin') {
		error(403, 'Forbidden');
	}

	const parentData = await parent();
	const plan = parentData.plan === 'pro' ? 'pro' : 'free';

	const [drivers, jobStats] = await Promise.all([
		listDriversForCompany(locals.supabase, profile),
		fetchDriverListJobStats(locals.supabase, profile.company_id)
	]);

	return {
		...buildDriversPageData(drivers, plan, jobStats),
		mockInvite: false
	};
};

export const actions = {
	invite: async ({ request, locals, url }) => {
		if (isPreviewMode(url.searchParams.get('preview'))) {
			return fail(400, { message: 'Invites are disabled in UI preview mode.' });
		}

		const profile = locals.profile;
		if (!profile || profile.role !== 'admin') {
			return fail(403, { message: 'Forbidden' });
		}

		const form = await request.formData();
		const full_name = form.get('full_name')?.toString().trim() ?? '';
		const phone = form.get('phone')?.toString().trim() ?? '';

		if (!full_name || !phone) {
			return fail(400, { message: 'Full name and mobile number are required.' });
		}

		try {
			const driver = await inviteDriver(locals.supabase, profile, {
				full_name,
				phone,
				activate_base_url: url.origin
			});

			return {
				inviteSuccess: true,
				invitedDriverName: driver.full_name,
				invite_link:
					driver.invite_token != null
						? buildDriverActivateUrl(url.origin, driver.invite_token)
						: null
			};
		} catch (err) {
			if (isUsersError(err)) {
				return fail(err.status, { message: err.message });
			}
			throw err;
		}
	},

	resend: async ({ request, locals, url }) => {
		if (isPreviewMode(url.searchParams.get('preview'))) {
			return fail(400, { message: 'Resend is disabled in UI preview mode.' });
		}

		const profile = locals.profile;
		if (!profile || profile.role !== 'admin') {
			return fail(403, { message: 'Forbidden' });
		}

		const form = await request.formData();
		const driver_id = form.get('driver_id')?.toString().trim() ?? '';

		if (!driver_id) {
			return fail(400, { message: 'Driver is required.' });
		}

		try {
			const driver = await resendInvite(
				locals.supabase,
				profile,
				driver_id,
				url.origin
			);

			if (!driver) {
				return fail(404, { message: 'Driver not found.' });
			}

			return {
				resendSuccess: true,
				driverId: driver.id,
				driverName: driver.full_name
			};
		} catch (err) {
			if (isUsersError(err)) {
				return fail(err.status, { message: err.message });
			}
			throw err;
		}
	}
} satisfies Actions;
