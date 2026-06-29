import type { SupabaseClient } from '@supabase/supabase-js';
import { notifyJobAssigned } from '$lib/server/notifications';
import { getAssignableDriver } from '$lib/server/users';
import type { Database } from '$lib/types/database';
import type { ApiErrorCode } from '$lib/types/api';
import type { UserProfile } from '$lib/types/user';
import type { JobStatus } from '$lib/types/job';

type JobRow = Database['public']['Tables']['jobs']['Row'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];
type AppSupabase = SupabaseClient<Database>;

export const FREE_JOB_LIMIT = 20;

export type CreateJobInput = Omit<JobInsert, 'company_id' | 'reference'> & {
	status?: string;
};

export type JobStatusCounts = {
	pending: number;
	in_progress: number;
	complete: number;
	attempted: number;
};

const DRIVER_PATCH_FIELDS = [
	'status',
	'started_at',
	'completed_at',
	'has_return_leg',
	'return_leg_empty'
] as const satisfies readonly (keyof JobUpdate)[];

export class JobsError extends Error {
	constructor(
		message: string,
		public readonly code: ApiErrorCode,
		public readonly status = 400
	) {
		super(message);
		this.name = 'JobsError';
	}
}

export function isJobsError(error: unknown): error is JobsError {
	return error instanceof JobsError;
}

function assertAdmin(profile: UserProfile): void {
	if (profile.role !== 'admin') {
		throw new JobsError('Forbidden', 'FORBIDDEN', 403);
	}
}

function startOfCalendarMonthUTC(): string {
	const now = new Date();
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

function pickFields<T extends Record<string, unknown>>(payload: T, allowed: readonly string[]) {
	return Object.fromEntries(
		Object.entries(payload).filter(([key]) => allowed.includes(key))
	) as Partial<T>;
}

async function getCompanyPlan(
	supabase: AppSupabase,
	companyId: string
): Promise<{ plan: string }> {
	const { data: company, error } = await supabase
		.from('companies')
		.select('plan, verification_status')
		.eq('id', companyId)
		.maybeSingle();

	if (error) throw error;
	if (!company) {
		throw new JobsError('Company not found', 'NOT_FOUND', 404);
	}

	if (company.verification_status !== 'verified') {
		throw new JobsError(
			'Company must be verified before creating jobs',
			'COMPANY_NOT_VERIFIED',
			403
		);
	}

	return { plan: company.plan };
}

async function countJobsCreatedThisMonth(
	supabase: AppSupabase,
	companyId: string
): Promise<number> {
	const monthStart = startOfCalendarMonthUTC();
	const { count, error } = await supabase
		.from('jobs')
		.select('id', { count: 'exact', head: true })
		.eq('company_id', companyId)
		.gte('created_at', monthStart);

	if (error) throw error;
	return count ?? 0;
}

async function assertJobCapacity(
	supabase: AppSupabase,
	companyId: string,
	plan: string
): Promise<void> {
	if (plan !== 'free') return;

	const count = await countJobsCreatedThisMonth(supabase, companyId);
	if (count >= FREE_JOB_LIMIT) {
		throw new JobsError(
			`Free plan allows up to ${FREE_JOB_LIMIT} jobs per month`,
			'JOB_LIMIT_REACHED',
			403
		);
	}
}

async function assertAssignableDriver(
	supabase: AppSupabase,
	companyId: string,
	driverId: string
): Promise<void> {
	const driver = await getAssignableDriver(supabase, companyId, driverId);
	if (!driver) {
		throw new JobsError(
			'Assigned driver must be an active driver in your company',
			'VALIDATION_ERROR',
			400
		);
	}
}

export async function recordJobStatusChange(
	supabase: AppSupabase,
	input: {
		jobId: string;
		companyId: string;
		changedBy: string;
		oldStatus: string | null;
		newStatus: string;
		note?: string | null;
		attachmentUrl?: string | null;
	}
): Promise<void> {
	const { error } = await supabase.from('job_status_history').insert({
		job_id: input.jobId,
		company_id: input.companyId,
		changed_by: input.changedBy,
		old_status: input.oldStatus,
		new_status: input.newStatus,
		note: input.note ?? null,
		attachment_url: input.attachmentUrl ?? null
	});

	if (error) throw error;
}

/** Validates driver-initiated status changes. Attempted deliveries use reportJobIssue(). */
export function validateDriverStatusTransition(
	currentStatus: string,
	nextStatus: string
): void {
	if (currentStatus === nextStatus) return;

	if (nextStatus === 'attempted') {
		throw new JobsError(
			'Use report issue to mark a delivery as attempted',
			'VALIDATION_ERROR',
			400
		);
	}

	const allowed: Record<JobStatus, JobStatus[]> = {
		pending: ['in_progress'],
		in_progress: ['complete'],
		complete: [],
		attempted: []
	};

	const permitted = allowed[currentStatus as JobStatus];
	if (!permitted?.includes(nextStatus as JobStatus)) {
		throw new JobsError(
			`Cannot change job status from ${currentStatus} to ${nextStatus}`,
			'VALIDATION_ERROR',
			400
		);
	}
}

function assertDriver(profile: UserProfile): void {
	if (profile.role !== 'driver') {
		throw new JobsError('Forbidden', 'FORBIDDEN', 403);
	}
}

/** Driver starts an assigned pending job. */
export async function startJobForDriver(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string
): Promise<JobRow | null> {
	assertDriver(profile);

	const existing = await getJobForUser(supabase, profile, jobId);
	if (!existing) return null;

	validateDriverStatusTransition(existing.status, 'in_progress');

	return updateJobForUser(supabase, profile, jobId, {
		status: 'in_progress',
		started_at: new Date().toISOString()
	});
}

/** Driver marks an in-progress job complete (PoD upload may call this separately). */
export async function completeJobForDriver(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string,
	completedAt?: string
): Promise<JobRow | null> {
	assertDriver(profile);

	const existing = await getJobForUser(supabase, profile, jobId);
	if (!existing) return null;

	validateDriverStatusTransition(existing.status, 'complete');

	return updateJobForUser(supabase, profile, jobId, {
		status: 'complete',
		completed_at: completedAt ?? new Date().toISOString()
	});
}

export function summarizeJobStatuses(jobs: JobRow[]): JobStatusCounts {
	return {
		pending: jobs.filter((job) => job.status === 'pending').length,
		in_progress: jobs.filter((job) => job.status === 'in_progress').length,
		complete: jobs.filter((job) => job.status === 'complete').length,
		attempted: jobs.filter((job) => job.status === 'attempted').length
	};
}

/** Admin: all company jobs. Driver: only assigned jobs. */
export async function listJobsForUser(
	supabase: AppSupabase,
	profile: UserProfile
): Promise<JobRow[]> {
	let query = supabase.from('jobs').select('*').order('scheduled_at', { ascending: true });

	if (profile.role === 'admin') {
		query = query.eq('company_id', profile.company_id);
	} else {
		query = query.eq('assigned_driver_id', profile.id);
	}

	const { data, error } = await query;
	if (error) throw error;
	return data ?? [];
}

/** Returns null when the job is not visible to this user (caller should 404). */
export async function getJobForUser(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string
): Promise<JobRow | null> {
	let query = supabase.from('jobs').select('*').eq('id', jobId);

	if (profile.role === 'admin') {
		query = query.eq('company_id', profile.company_id);
	} else {
		query = query.eq('assigned_driver_id', profile.id);
	}

	const { data, error } = await query.maybeSingle();
	if (error) throw error;
	return data;
}

/** Role-aware partial update. Drivers are field-whitelisted. */
export async function updateJobForUser(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string,
	payload: Record<string, unknown>
): Promise<JobRow | null> {
	const existing = await getJobForUser(supabase, profile, jobId);
	if (!existing) return null;

	const patch =
		profile.role === 'admin'
			? (payload as JobUpdate)
			: pickFields(payload, DRIVER_PATCH_FIELDS);

	const nextStatus =
		typeof patch.status === 'string' ? patch.status : undefined;
	const statusChanging =
		nextStatus !== undefined && nextStatus !== existing.status;

	if (profile.role === 'driver' && statusChanging && nextStatus) {
		validateDriverStatusTransition(existing.status, nextStatus);
	}

	const { data, error } = await supabase
		.from('jobs')
		.update(patch as JobUpdate)
		.eq('id', jobId)
		.select('*')
		.single();

	if (error) throw error;

	if (statusChanging && nextStatus) {
		await recordJobStatusChange(supabase, {
			jobId: existing.id,
			companyId: existing.company_id,
			changedBy: profile.id,
			oldStatus: existing.status,
			newStatus: nextStatus
		});
	}

	return data;
}

/** Admin-only job creation. */
export async function createJobForUser(
	supabase: AppSupabase,
	profile: UserProfile,
	jobData: CreateJobInput
): Promise<JobRow> {
	assertAdmin(profile);

	const { plan } = await getCompanyPlan(supabase, profile.company_id);
	await assertJobCapacity(supabase, profile.company_id, plan);

	if (jobData.assigned_driver_id) {
		await assertAssignableDriver(supabase, profile.company_id, jobData.assigned_driver_id);
	}

	const insertPayload: JobInsert = {
		...jobData,
		company_id: profile.company_id,
		status: jobData.status ?? 'pending'
	};

	const { data, error } = await supabase.from('jobs').insert(insertPayload).select('*').single();

	if (error) throw error;

	await recordJobStatusChange(supabase, {
		jobId: data.id,
		companyId: data.company_id,
		changedBy: profile.id,
		oldStatus: null,
		newStatus: data.status
	});

	if (data.assigned_driver_id) {
		await notifyJobAssigned(supabase, {
			companyId: data.company_id,
			driverUserId: data.assigned_driver_id,
			jobId: data.id,
			reference: data.reference,
			pickupAddress: data.pickup_address,
			scheduledAt: data.scheduled_at
		});
	}

	return data;
}

export type AdminJobDetailsUpdate = {
	pickup_address: string;
	pickup_lat: number;
	pickup_lng: number;
	dropoff_address: string;
	dropoff_lat: number;
	dropoff_lng: number;
	scheduled_at: string;
	assigned_driver_id: string;
	notes: string | null;
};

/** Admin edit form — validates driver and notifies on reassignment. */
export async function updateAdminJobDetails(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string,
	update: AdminJobDetailsUpdate
): Promise<JobRow | null> {
	assertAdmin(profile);

	const existing = await getJobForUser(supabase, profile, jobId);
	if (!existing) return null;

	if (update.assigned_driver_id !== existing.assigned_driver_id) {
		await assertAssignableDriver(supabase, profile.company_id, update.assigned_driver_id);
	}

	const job = await updateJobForUser(supabase, profile, jobId, update);
	if (!job) return null;

	if (
		job.assigned_driver_id &&
		job.assigned_driver_id !== existing.assigned_driver_id
	) {
		await notifyJobAssigned(supabase, {
			companyId: job.company_id,
			driverUserId: job.assigned_driver_id,
			jobId: job.id,
			reference: job.reference,
			pickupAddress: job.pickup_address,
			scheduledAt: job.scheduled_at
		});
	}

	return job;
}

/** Admin-only job deletion. Completed jobs cannot be deleted. */
export async function deleteJobForUser(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string
): Promise<boolean> {
	assertAdmin(profile);

	const existing = await getJobForUser(supabase, profile, jobId);
	if (!existing) return false;

	if (existing.status === 'complete') {
		throw new JobsError('Completed jobs cannot be deleted', 'VALIDATION_ERROR', 400);
	}

	const { error } = await supabase
		.from('jobs')
		.delete()
		.eq('id', jobId)
		.eq('company_id', profile.company_id);

	if (error) throw error;
	return true;
}

export { DRIVER_PATCH_FIELDS };
