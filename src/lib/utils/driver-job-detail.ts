import type { Database } from '$lib/types/database';
import type {
	DriverJobDetailAction,
	DriverJobDetailPageData,
	DriverJobProgressStage
} from '$lib/types/driver-job-detail';
import type { JobStatus } from '$lib/types/job';

type JobRow = Database['public']['Tables']['jobs']['Row'];

export function formatJobReference(reference: string): string {
	return reference.startsWith('#') ? reference : `#${reference}`;
}

export function formatDriverJobDate(scheduledAt: string): string {
	return new Date(scheduledAt).toLocaleDateString('en-GB', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
}

export function formatDriverJobTime(scheduledAt: string): string {
	return new Date(scheduledAt)
		.toLocaleTimeString('en-GB', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		})
		.replace(' ', '')
		.toLowerCase();
}

export function formatDriverProgressTimestamp(value: string): string {
	const date = new Date(value);
	const datePart = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	const timePart = date
		.toLocaleTimeString('en-GB', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		})
		.replace(' ', '')
		.toLowerCase();

	return `${datePart}, ${timePart}`;
}

export function mapsDirectionsUrl(address: string): string {
	return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export function parseIssueReasonFromNote(note: string | null): string {
	if (!note?.trim()) return 'Issue reported';
	const [reason] = note.split(' — ');
	return reason?.trim() || note.trim();
}

function buildProgressStages(job: JobRow): DriverJobProgressStage[] {
	const stages: DriverJobProgressStage[] = [
		{
			id: 'created',
			label: 'Job created',
			subtitle: 'Assigned to you',
			state: 'upcoming',
			timestamp: job.created_at
		},
		{
			id: 'picked_up',
			label: 'Picked up',
			subtitle: 'Goods collected',
			state: 'upcoming',
			timestamp: job.started_at
		},
		{
			id: 'delivered',
			label: 'Delivered',
			subtitle: 'Proof of delivery saved',
			state: 'upcoming',
			timestamp: null
		},
		{
			id: 'complete',
			label: 'Complete',
			subtitle: 'Job closed',
			state: 'upcoming',
			timestamp: job.status === 'complete' ? job.completed_at : null
		}
	];

	if (job.status === 'pending') {
		stages[0].state = 'complete';
		return stages;
	}

	if (job.status === 'in_progress') {
		stages[0].state = 'complete';
		stages[1].state = 'current';
		stages[1].subtitle = 'In progress...';
		return stages;
	}

	if (job.status === 'attempted') {
		stages[0].state = 'complete';
		stages[1].state = 'complete';
		stages[2].state = 'current';
		stages[2].label = 'Delivery attempted';
		stages[2].subtitle = '';
		stages[2].tone = 'danger';
		return stages;
	}

	if (job.status === 'complete') {
		for (const stage of stages) {
			stage.state = 'complete';
		}
		return stages;
	}

	return stages;
}

function buildActions(job: JobRow): {
	primary: DriverJobDetailAction | null;
	secondary: DriverJobDetailAction[];
} {
	if (job.status === 'pending') {
		return {
			primary: {
				kind: 'start',
				label: 'Start job',
				hint: "Tap when you've collected the goods"
			},
			secondary: []
		};
	}

	if (job.status === 'in_progress') {
		return {
			primary: {
				kind: 'complete',
				label: 'Complete job',
				hint: 'Tap when goods have been delivered',
				href: `/jobs/${job.id}/complete`
			},
			secondary: [
				{
					kind: 'report_issue',
					label: 'Report issue',
					href: `/jobs/${job.id}/report-issue`
				}
			]
		};
	}

	if (job.status === 'attempted') {
		return {
			primary: null,
			secondary: []
		};
	}

	return {
		primary: null,
		secondary: []
	};
}

export function buildDriverJobDetailPageData(
	job: JobRow,
	vehicleLabel: string | null,
	options?: {
		deliveredAt?: string | null;
		issueReason?: string | null;
		attemptedAt?: string | null;
	}
): DriverJobDetailPageData {
	const status = job.status as JobStatus;
	const directionsAddress =
		status === 'pending' ? job.pickup_address : job.dropoff_address;
	const { primary, secondary } = buildActions(job);
	const progressStages = buildProgressStages(job);

	if (status === 'complete' && options?.deliveredAt) {
		const deliveredStage = progressStages.find((stage) => stage.id === 'delivered');
		if (deliveredStage) {
			deliveredStage.timestamp = options.deliveredAt;
		}
	}

	if (status === 'attempted') {
		const attemptedStage = progressStages.find((stage) => stage.id === 'delivered');
		if (attemptedStage) {
			if (options?.issueReason) {
				attemptedStage.reason_tag = options.issueReason;
			}
			if (options?.attemptedAt) {
				attemptedStage.timestamp = options.attemptedAt;
			}
		}
	}

	const issueReason = options?.issueReason ?? null;

	return {
		id: job.id,
		reference: formatJobReference(job.reference),
		status,
		pickup_address: job.pickup_address,
		dropoff_address: job.dropoff_address,
		scheduled_date_label: formatDriverJobDate(job.scheduled_at),
		scheduled_time_label: formatDriverJobTime(job.scheduled_at),
		vehicle_label: vehicleLabel,
		notes: job.notes?.trim() || null,
		directions_address: directionsAddress,
		progress_stages: progressStages,
		primary_action: primary,
		secondary_actions: secondary,
		completion_banner:
			status === 'complete' && job.completed_at
				? { time_label: formatDriverJobTime(job.completed_at) }
				: null,
		attempted_banner:
			status === 'attempted' && issueReason ? { reason: issueReason } : null
	};
}
