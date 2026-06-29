import type { DriverProfileData } from '$lib/types/drivers';

/** Figma 9A / 9D — Driver Profile (Paid / Dark) sample data for UI preview. */
export function getMockDriverProfilePaid(): DriverProfileData {
	return {
		plan: 'pro',
		driver: {
			id: 'mock-driver-james',
			full_name: 'James Okafor',
			phone: '07700 900123',
			status: 'active',
			added_at: '2026-06-03T10:00:00.000Z',
			jobs_this_month: 14,
			on_time_rate: 94,
			last_active: { primary: 'Today', secondary: 'at 2:34pm' }
		},
		performance: {
			on_time_rate: 94,
			total_jobs_done: 87,
			attempted_deliveries: 3,
			avg_jobs_per_week: 6.2,
			jobs_per_week: [
				{ label: 'W1', value: 6 },
				{ label: 'W2', value: 8 },
				{ label: 'W3', value: 4.5 },
				{ label: 'W4', value: 10 }
			]
		},
		jobs: {
			counts: {
				all: 47,
				pending: 8,
				in_progress: 5,
				complete: 28,
				attempted: 6
			},
			rows: [
				{
					id: 'job-0042',
					reference: '#0042',
					pickup_address: '14 Oak Lane, Bristol',
					dropoff_address: '88 Park St, Bath',
					status: 'complete',
					date_label: '9 Jun',
					show_view_action: true
				},
				{
					id: 'job-0041',
					reference: '#0041',
					pickup_address: '22 High St, Bath',
					dropoff_address: '5 River Rd, Bristol',
					status: 'in_progress',
					date_label: 'Today'
				},
				{
					id: 'job-0040',
					reference: '#0040',
					pickup_address: '7 Mill Lane, Cardiff',
					dropoff_address: '19 Queen St, Newport',
					status: 'pending',
					date_label: '8 Jun'
				},
				{
					id: 'job-0039',
					reference: '#0039',
					pickup_address: '3 Hill St, Exeter',
					dropoff_address: '12 Bay View, Plymouth',
					status: 'attempted',
					date_label: '7 Jun'
				},
				{
					id: 'job-0038',
					reference: '#0038',
					pickup_address: '55 Cedar Dr, Bristol',
					dropoff_address: '88 Birch Ct, Bath',
					status: 'complete',
					date_label: '7 Jun'
				}
			],
			pagination: { from: 1, to: 10, total: 47 }
		},
		activity: [
			{
				id: 'activity-1',
				kind: 'complete',
				title: 'Completed job #0042',
				timestamp_label: 'Today at 11:42am'
			},
			{
				id: 'activity-2',
				kind: 'started',
				title: 'Started job #0041',
				timestamp_label: 'Today at 9:14am'
			},
			{
				id: 'activity-3',
				kind: 'attempted',
				title: 'Attempted delivery on #0039 — No answer',
				timestamp_label: 'Yesterday at 3:22pm'
			},
			{
				id: 'activity-4',
				kind: 'activated',
				title: 'Account activated',
				timestamp_label: '3 Jun 2026'
			}
		]
	};
}

/** Figma 9B — Driver Profile (Free) sample data for UI preview. */
export function getMockDriverProfileFree(): DriverProfileData {
	const paid = getMockDriverProfilePaid();

	return {
		...paid,
		plan: 'free',
		driver: {
			...paid.driver,
			on_time_rate: undefined
		},
		performance: undefined
	};
}

/** Figma 9C — Driver Profile (Pending) sample data for UI preview. */
export function getMockDriverProfilePending(): DriverProfileData {
	return {
		plan: 'free',
		driver: {
			id: 'mock-driver-sarah',
			full_name: 'Sarah Chen',
			phone: '07700 900456',
			status: 'pending',
			added_at: '2026-06-05T10:00:00.000Z',
			jobs_this_month: 0,
			last_active: null
		},
		jobs: {
			counts: {
				all: 0,
				pending: 0,
				in_progress: 0,
				complete: 0,
				attempted: 0
			},
			rows: [],
			pagination: { from: 0, to: 0, total: 0 }
		},
		activity: [
			{
				id: 'activity-pending-1',
				kind: 'invite',
				title: 'Invite sent via SMS',
				timestamp_label: '5 Jun 2026 at 10:00am'
			}
		]
	};
}

export function getMockDriverProfileForId(id: string): DriverProfileData | null {
	if (id === 'mock-driver-james') {
		return getMockDriverProfilePaid();
	}

	if (id === 'mock-driver-sarah') {
		return getMockDriverProfilePending();
	}

	return null;
}
