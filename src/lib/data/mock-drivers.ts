import type { DriversPageData } from '$lib/types/drivers';
import { FREE_DRIVER_LIMIT } from '$lib/server/users';

/** Figma 8A — Drivers List (Active) sample data for UI preview. */
export function getMockDriversActive(): DriversPageData {
	return {
		plan: 'free',
		slotUsage: { used: 2, limit: FREE_DRIVER_LIMIT },
		stats: {
			active: 2,
			pending: 1,
			jobsThisMonth: 23,
			onJobNow: 2
		},
		drivers: [
			{
				id: 'mock-driver-james',
				full_name: 'James Okafor',
				phone: '07700 900123',
				status: 'active',
				jobs_this_month: 14,
				added_at: '2026-06-03T10:00:00.000Z',
				last_active: { primary: 'Today', secondary: 'at 2:34pm' },
				show_copy_phone: true,
				actions: { view: true, more: true }
			},
			{
				id: 'mock-driver-sarah',
				full_name: 'Sarah Chen',
				phone: '07700 900456',
				status: 'pending',
				status_detail: 'Invite sent',
				jobs_this_month: 0,
				added_at: '2026-06-05T10:00:00.000Z',
				last_active: null,
				actions: { view: true, resend: true, more: true }
			},
			{
				id: 'mock-driver-mike',
				full_name: 'Mike Torres',
				phone: '07700 900789',
				status: 'active',
				jobs_this_month: 9,
				added_at: '2026-06-01T10:00:00.000Z',
				last_active: { primary: '2 days ago' },
				show_copy_phone: true,
				actions: { view: false, more: false }
			}
		]
	};
}

/** Figma 8B — Drivers List (At Limit) sample data for UI preview. */
export function getMockDriversAtLimit(): DriversPageData {
	const active = getMockDriversActive();

	return {
		...active,
		slotUsage: { used: FREE_DRIVER_LIMIT, limit: FREE_DRIVER_LIMIT },
		stats: {
			active: 3,
			pending: 0,
			jobsThisMonth: 23,
			onJobNow: 2
		}
	};
}

/** Figma 8D — Drivers List (Panel Success) sample data for UI preview. */
export function getMockDriversPanelSuccess(): DriversPageData {
	return {
		...getMockDriversActive(),
		panelOpen: true,
		panelSuccess: true,
		invitedDriverName: 'James Okafor'
	};
}

/** Figma 8F — Drivers List (Empty) sample data for UI preview. */
export function getMockDriversEmpty(): DriversPageData {
	const active = getMockDriversActive();

	return {
		...active,
		drivers: []
	};
}
