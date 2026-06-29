import type { SupabaseClient } from '@supabase/supabase-js';
import { applyJobDetailPlanFeatures } from '$lib/data/mock-operator-job-detail';
import type { Database } from '$lib/types/database';
import type {
	OperatorJobCostData,
	OperatorJobDetailPageData,
	OperatorJobPod,
	OperatorJobTimelineEvent
} from '$lib/types/operator-job-detail';
import type { UserProfile } from '$lib/types/user';
import { getJobForUser } from '$lib/server/jobs';

type AppSupabase = SupabaseClient<Database>;
type JobRow = Database['public']['Tables']['jobs']['Row'];

function formatJobReference(reference: string) {
	return reference.startsWith('#') ? reference : `#${reference}`;
}

function formatDriverStatus(status: string | null | undefined) {
	if (!status) return 'Unknown';
	return status.charAt(0).toUpperCase() + status.slice(1);
}

function buildBlockchainRef(jobId: string) {
	const compact = jobId.replace(/-/g, '');
	return `${compact.slice(0, 4)}...${compact.slice(-4)}`;
}

function buildTimeline(job: JobRow, attemptedNote: string | null): OperatorJobTimelineEvent[] {
	const events: OperatorJobTimelineEvent[] = [
		{
			id: 'created',
			label: 'Job created',
			timestamp: job.created_at,
			state: 'complete'
		}
	];

	if (job.status === 'pending') {
		events.push(
			{ id: 'started', label: 'Job started', timestamp: null, state: 'pending' },
			{ id: 'completed', label: 'Delivery completed', timestamp: null, state: 'pending' },
			{ id: 'invoice', label: 'Invoice generated', timestamp: null, state: 'pending' }
		);
		return events;
	}

	if (job.status === 'in_progress') {
		events.push(
			{
				id: 'started',
				label: 'Job started',
				timestamp: job.started_at,
				state: 'active',
				statusLabel: 'In progress...'
			},
			{ id: 'completed', label: 'Delivery completed', timestamp: null, state: 'pending' },
			{ id: 'invoice', label: 'Invoice generated', timestamp: null, state: 'pending' }
		);
		return events;
	}

	if (job.status === 'attempted') {
		events.push(
			{
				id: 'started',
				label: 'Job started',
				timestamp: job.started_at,
				state: 'complete'
			},
			{
				id: 'attempted',
				label: 'Delivery attempted',
				timestamp: job.completed_at,
				state: 'failed',
				reason: attemptedNote ?? 'No answer'
			},
			{ id: 'invoice', label: 'Invoice generated', timestamp: null, state: 'pending' }
		);
		return events;
	}

	events.push(
		{
			id: 'started',
			label: 'Job started',
			timestamp: job.started_at,
			state: 'complete'
		},
		{
			id: 'completed',
			label: 'Delivery completed',
			timestamp: job.completed_at,
			state: 'complete'
		},
		{ id: 'invoice', label: 'Invoice generated', timestamp: null, state: 'pending' }
	);

	return events;
}

function buildPod(job: JobRow, driverName: string): OperatorJobPod {
	if (job.status === 'complete' && job.completed_at) {
		return {
			status: 'submitted',
			completed_by: driverName,
			timestamp: job.completed_at,
			blockchain_ref: buildBlockchainRef(job.id)
		};
	}

	return { status: 'awaiting' };
}

function buildCost(job: JobRow): OperatorJobCostData | null {
	const fuelCost = job.fuel_cost;
	const jobValue = job.job_value;

	if (fuelCost == null || jobValue == null) {
		return null;
	}

	const margin = jobValue - fuelCost;

	return {
		fuel_cost: fuelCost,
		job_value: jobValue,
		margin,
		margin_percent: jobValue > 0 ? (margin / jobValue) * 100 : 0
	};
}

async function resolveDriverInfo(
	supabase: AppSupabase,
	companyId: string,
	driverId: string | null
) {
	if (!driverId) {
		return { name: 'Unassigned', status: '—' };
	}

	const { data, error } = await supabase
		.from('users')
		.select('full_name, status')
		.eq('id', driverId)
		.eq('company_id', companyId)
		.maybeSingle();

	if (error) throw error;

	if (!data) {
		return { name: 'Unknown driver', status: '—' };
	}

	return {
		name: data.full_name,
		status: formatDriverStatus(data.status)
	};
}

async function getAttemptedNote(
	supabase: AppSupabase,
	companyId: string,
	jobId: string
) {
	const { data, error } = await supabase
		.from('job_status_history')
		.select('note')
		.eq('job_id', jobId)
		.eq('company_id', companyId)
		.eq('new_status', 'attempted')
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error) throw error;
	return data?.note ?? null;
}

export function buildOperatorJobDetailPageData(
	job: JobRow,
	driver: { name: string; status: string },
	attemptedNote: string | null
): OperatorJobDetailPageData {
	return {
		id: job.id,
		reference: formatJobReference(job.reference),
		status: job.status,
		created_at: job.created_at,
		pickup_address: job.pickup_address,
		dropoff_address: job.dropoff_address,
		scheduled_at: job.scheduled_at,
		driver_name: driver.name,
		driver_status: driver.status,
		notes: job.notes?.trim() || '—',
		timeline: buildTimeline(job, attemptedNote),
		pod: buildPod(job, driver.name),
		cost: buildCost(job),
		invoice_enabled: true
	};
}

export async function fetchOperatorJobDetailPageData(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string,
	plan: string,
	preview: string | null = null
): Promise<OperatorJobDetailPageData | null> {
	const job = await getJobForUser(supabase, profile, jobId);
	if (!job) return null;

	const [driver, attemptedNote] = await Promise.all([
		resolveDriverInfo(supabase, profile.company_id, job.assigned_driver_id),
		job.status === 'attempted'
			? getAttemptedNote(supabase, profile.company_id, job.id)
			: Promise.resolve(null)
	]);

	const pageData = buildOperatorJobDetailPageData(job, driver, attemptedNote);
	return applyJobDetailPlanFeatures(pageData, plan, preview);
}
