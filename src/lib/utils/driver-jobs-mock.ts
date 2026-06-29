import type { DriverJobsPageData } from '$lib/types/driver-jobs';

const SELECTED_DATE = '2025-06-09';

const MOCK_DATE_PILLS: DriverJobsPageData['date_pills'] = [
	{ date: '2025-06-08', label: 'Sun 8', job_count: 0 },
	{ date: '2025-06-09', label: 'Mon 9', job_count: 3 },
	{ date: '2025-06-10', label: 'Tue 10', job_count: 2 },
	{ date: '2025-06-11', label: 'Wed 11', job_count: 1 },
	{ date: '2025-06-12', label: 'Thu 12', job_count: 0 },
	{ date: '2025-06-13', label: 'Fri 13', job_count: 0 },
	{ date: '2025-06-14', label: 'Sat 14', job_count: 0 }
];

const MOCK_GREETING = {
	greeting: 'Good morning',
	driver_first_name: 'James',
	selected_date: SELECTED_DATE,
	selected_date_label: 'Monday, 9 June',
	date_pills: MOCK_DATE_PILLS
};

export function mockDriverJobsPageData4A(): DriverJobsPageData {
	return {
		...MOCK_GREETING,
		stats: { pending: 2, in_progress: 1, complete: 4 },
		active_job: {
			id: 'job-0041',
			reference: '#0041',
			destination_label: 'Manchester'
		},
		morning_jobs: [
			{
				id: 'job-0042',
				reference: '#0042',
				status: 'in_progress',
				pickup_address: '14 Bold Street, Liverpool',
				dropoff_address: '22 King Street, Manchester',
				scheduled_at: '2025-06-09T09:30:00',
				vehicle_label: 'Van',
				has_notes: true,
				time_period: 'morning'
			}
		],
		afternoon_jobs: [
			{
				id: 'job-0043',
				reference: '#0043',
				status: 'pending',
				pickup_address: '5 Park Lane, Liverpool',
				dropoff_address: '9 High Street, Manchester',
				scheduled_at: '2025-06-09T11:30:00',
				vehicle_label: 'Car',
				time_period: 'afternoon'
			},
			{
				id: 'job-0044',
				reference: '#0044',
				status: 'complete',
				pickup_address: '3 River Rd, Liverpool',
				dropoff_address: '18 Market St, Manchester',
				scheduled_at: '2025-06-09T07:15:00',
				vehicle_label: 'Van',
				time_period: 'afternoon'
			}
		],
		has_unread_notifications: true
	};
}

export function mockDriverJobsPageData4B(): DriverJobsPageData {
	return {
		...MOCK_GREETING,
		stats: { pending: 0, in_progress: 0, complete: 0 },
		active_job: null,
		morning_jobs: [],
		afternoon_jobs: [],
		has_unread_notifications: false
	};
}

export function mockDriverJobsPageData4D(): DriverJobsPageData {
	return {
		...MOCK_GREETING,
		stats: { pending: 2, in_progress: 1, complete: 4 },
		active_job: null,
		morning_jobs: [
			{
				id: 'job-0042',
				reference: '#0042',
				status: 'in_progress',
				pickup_address: '14 Bold Street, Liverpool',
				dropoff_address: '22 King Street, Manchester',
				scheduled_at: '2025-06-09T09:30:00',
				vehicle_label: 'Van',
				show_complete_action: true,
				time_period: 'morning'
			}
		],
		afternoon_jobs: [],
		has_unread_notifications: true
	};
}

export function mockDriverJobsPageData4E(): DriverJobsPageData {
	return {
		greeting: 'Good morning',
		driver_first_name: 'James',
		selected_date: '2025-06-11',
		selected_date_label: 'Wednesday, 11 June',
		date_pills: MOCK_DATE_PILLS,
		stats: { pending: 1, in_progress: 0, complete: 0 },
		active_job: null,
		morning_jobs: [
			{
				id: 'job-0045',
				reference: '#0045',
				status: 'pending',
				pickup_address: '10 Dock Rd, Liverpool',
				dropoff_address: '88 Wharf St, Manchester',
				scheduled_at: '2025-06-11T10:00:00',
				vehicle_label: 'Van',
				time_period: 'morning'
			}
		],
		afternoon_jobs: [],
		has_unread_notifications: true
	};
}

export function mockDriverJobsPageDataForPreview(preview: string | null): DriverJobsPageData {
	if (preview === '4b' || preview === 'empty') {
		return mockDriverJobsPageData4B();
	}

	if (preview === '4d' || preview === 'in-progress' || preview === 'in_progress') {
		return mockDriverJobsPageData4D();
	}

	if (preview === '4e' || preview === 'future-day' || preview === 'future') {
		return mockDriverJobsPageData4E();
	}

	if (preview === '4f' || preview === 'scrolled') {
		return mockDriverJobsPageData4A();
	}

	return mockDriverJobsPageData4A();
}
