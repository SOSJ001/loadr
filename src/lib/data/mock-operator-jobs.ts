import type { OperatorJobListRow, OperatorJobsPageData } from '$lib/types/operator-jobs';

const MOCK_DRIVERS = [
	{ id: 'mock-driver-1', full_name: 'James Okafor' },
	{ id: 'mock-driver-2', full_name: 'Sarah Chen' },
	{ id: 'mock-driver-3', full_name: 'Mike Torres' }
];

const MOCK_STATS = {
	pending: 12,
	inProgress: 3,
	complete: 47,
	attempted: 2
};

const FIGMA_ROWS: Omit<
	OperatorJobListRow,
	'id' | 'reference' | 'pickup_address' | 'dropoff_address'
>[] = [
	{
		pickup_line1: '14 Oak Lane',
		pickup_line2: 'Bristol',
		dropoff_line1: '88 Park St',
		dropoff_line2: 'Bath',
		driver_id: 'mock-driver-1',
		driver_name: 'James Okafor',
		status: 'complete',
		scheduled_at: '2026-06-09T09:30:00.000Z'
	},
	{
		pickup_line1: '22 High St',
		pickup_line2: 'Bath',
		dropoff_line1: '5 River Rd',
		dropoff_line2: 'Bristol',
		driver_id: 'mock-driver-2',
		driver_name: 'Sarah Chen',
		status: 'in_progress',
		scheduled_at: new Date(new Date().setHours(14, 15, 0, 0)).toISOString()
	},
	{
		pickup_line1: '7 Mill Lane',
		pickup_line2: 'Cardiff',
		dropoff_line1: '19 Queen St',
		dropoff_line2: 'Newport',
		driver_id: null,
		driver_name: null,
		status: 'pending',
		scheduled_at: '2026-06-08T11:00:00.000Z'
	},
	{
		pickup_line1: '3 Hill St',
		pickup_line2: 'Exeter',
		dropoff_line1: '12 Bay View',
		dropoff_line2: 'Plymouth',
		driver_id: 'mock-driver-3',
		driver_name: 'Mike Torres',
		status: 'attempted',
		scheduled_at: '2026-06-07T16:45:00.000Z'
	},
	{
		pickup_line1: '55 Cedar Dr',
		pickup_line2: 'Bristol',
		dropoff_line1: '88 Birch Ct',
		dropoff_line2: 'Bath',
		driver_id: 'mock-driver-2',
		driver_name: 'Sarah Chen',
		status: 'pending',
		scheduled_at: '2026-06-07T08:00:00.000Z'
	},
	{
		pickup_line1: '41 Station Rd',
		pickup_line2: 'Swindon',
		dropoff_line1: '2 Church Ln',
		dropoff_line2: 'Oxford',
		driver_id: 'mock-driver-1',
		driver_name: 'James Okafor',
		status: 'complete',
		scheduled_at: '2026-06-06T10:15:00.000Z'
	},
	{
		pickup_line1: '9 Market Sq',
		pickup_line2: 'Gloucester',
		dropoff_line1: '16 Forge St',
		dropoff_line2: 'Cheltenham',
		driver_id: 'mock-driver-3',
		driver_name: 'Mike Torres',
		status: 'in_progress',
		scheduled_at: '2026-06-06T13:30:00.000Z'
	},
	{
		pickup_line1: '6 Dock Rd',
		pickup_line2: 'Southampton',
		dropoff_line1: '24 Harbour Way',
		dropoff_line2: 'Portsmouth',
		driver_id: null,
		driver_name: null,
		status: 'pending',
		scheduled_at: '2026-06-05T15:00:00.000Z'
	}
];

function job(row: OperatorJobListRow): OperatorJobListRow {
	return {
		...row,
		pickup_address: `${row.pickup_line1}, ${row.pickup_line2}`,
		dropoff_address: `${row.dropoff_line1}, ${row.dropoff_line2}`
	};
}

function buildMockJob(index: number, templateIndex: number): OperatorJobListRow {
	const template = FIGMA_ROWS[templateIndex % FIGMA_ROWS.length];
	const dayOffset = Math.floor(templateIndex / FIGMA_ROWS.length);
	const scheduled = new Date(template.scheduled_at);
	scheduled.setDate(scheduled.getDate() - dayOffset);
	const referenceNumber = index < 43 ? 42 - index : 199 - (index - 43);

	return job({
		id: `mock-${String(referenceNumber).padStart(4, '0')}`,
		reference: `#${String(referenceNumber).padStart(4, '0')}`,
		pickup_line1: template.pickup_line1,
		pickup_line2: template.pickup_line2,
		dropoff_line1: template.dropoff_line1,
		dropoff_line2: template.dropoff_line2,
		pickup_address: '',
		dropoff_address: '',
		driver_id: template.driver_id,
		driver_name: template.driver_name,
		status: template.status,
		scheduled_at: scheduled.toISOString()
	});
}

/** Figma 5E — Jobs List (Empty / filtered with no results). */
export function getMockOperatorJobsEmpty(): OperatorJobsPageData {
	return {
		stats: MOCK_STATS,
		jobs: [],
		drivers: MOCK_DRIVERS,
		totalJobs: 0
	};
}

/** Figma 5A / 5B — Jobs List (Full). 63 rows for working client-side pagination. */
export function getMockOperatorJobsPopulated(): OperatorJobsPageData {
	const rows = Array.from({ length: 63 }, (_, index) => buildMockJob(index, index));

	return {
		stats: MOCK_STATS,
		drivers: MOCK_DRIVERS,
		jobs: rows,
		totalJobs: 63
	};
}

export function isMockJobAttempted(jobId: string): boolean {
	const row = getMockOperatorJobsPopulated().jobs.find((job) => job.id === jobId);
	return row?.status === 'attempted';
}

export function isMockJobInProgress(jobId: string): boolean {
	const row = getMockOperatorJobsPopulated().jobs.find((job) => job.id === jobId);
	return row?.status === 'in_progress';
}
