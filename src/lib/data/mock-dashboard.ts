import type { DashboardPageData } from '$lib/types/dashboard';

/** Figma 4B — Dashboard (Active) sample data for UI preview. */
export function getMockDashboardActive(): DashboardPageData {
	return {
		stats: {
			pending: 4,
			inProgress: 2,
			completedToday: 7
		},
		showOnboardingBanner: false,
		showPendingVerificationBanner: false,
		recentJobs: [
			{
				id: 'mock-0042',
				reference: '#0042',
				pickup_address: '14 Bold St',
				dropoff_address: '456 Oak Ave',
				driver_name: 'James Okafor',
				status: 'complete',
				scheduled_at: new Date().toISOString()
			},
			{
				id: 'mock-0041',
				reference: '#0041',
				pickup_address: '789 Elm Rd',
				dropoff_address: '321 Pine Ln',
				driver_name: 'Sarah Chen',
				status: 'in_progress',
				scheduled_at: new Date().toISOString()
			},
			{
				id: 'mock-0040',
				reference: '#0040',
				pickup_address: '55 Cedar Dr',
				dropoff_address: '88 Birch Ct',
				driver_name: 'James Okafor',
				status: 'pending',
				scheduled_at: '2026-06-09T09:00:00.000Z'
			},
			{
				id: 'mock-0039',
				reference: '#0039',
				pickup_address: '12 River Rd',
				dropoff_address: '90 Lake View',
				driver_name: 'Mike Torres',
				status: 'complete',
				scheduled_at: '2026-06-08T09:00:00.000Z'
			},
			{
				id: 'mock-0038',
				reference: '#0038',
				pickup_address: '3 Hill St',
				dropoff_address: '77 Park Ave',
				driver_name: 'Sarah Chen',
				status: 'pending',
				scheduled_at: '2026-06-07T09:00:00.000Z'
			}
		]
	};
}

/** Figma 4E — Dashboard (Pending verification banner) preview data. */
export function getMockDashboardPendingVerification(): DashboardPageData {
	return {
		...getMockDashboardActive(),
		showPendingVerificationBanner: true,
		showOnboardingBanner: false
	};
}
