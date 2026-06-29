import type { SupabaseClient } from '@supabase/supabase-js';
import { JobsError, completeJobForDriver, getJobForUser } from '$lib/server/jobs';
import { notifyJobComplete } from '$lib/server/notifications';
import { uploadJobFile } from '$lib/server/storage';
import type { Database } from '$lib/types/database';
import type { UserProfile } from '$lib/types/user';

type JobRow = Database['public']['Tables']['jobs']['Row'];
type AppSupabase = SupabaseClient<Database>;

function assertDriver(profile: UserProfile): void {
	if (profile.role !== 'driver') {
		throw new JobsError('Forbidden', 'FORBIDDEN', 403);
	}
}

function photoFromFormData(formData: FormData): File {
	const photo = formData.get('photo');
	if (!(photo instanceof File) || photo.size === 0) {
		throw new JobsError('Delivery photo is required', 'VALIDATION_ERROR', 400);
	}
	return photo;
}

/** Driver uploads proof of delivery and completes the job. */
export async function uploadPodForJob(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string,
	formData: FormData
): Promise<JobRow> {
	assertDriver(profile);

	const existing = await getJobForUser(supabase, profile, jobId);
	if (!existing) {
		throw new JobsError('Job not found', 'NOT_FOUND', 404);
	}

	if (existing.status !== 'in_progress') {
		throw new JobsError(
			'Proof of delivery can only be submitted for in-progress jobs',
			'VALIDATION_ERROR',
			400
		);
	}

	const { data: existingPod } = await supabase
		.from('proof_of_delivery')
		.select('id')
		.eq('job_id', jobId)
		.maybeSingle();

	if (existingPod) {
		throw new JobsError('Proof of delivery already submitted for this job', 'VALIDATION_ERROR', 400);
	}

	const photo = photoFromFormData(formData);
	const recipientName = String(formData.get('recipient_name') ?? '').trim() || null;
	const completedAt = new Date().toISOString();

	let filePath: string;
	try {
		filePath = await uploadJobFile({
			companyId: existing.company_id,
			jobId: existing.id,
			category: 'pod',
			file: photo
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Photo upload failed';
		throw new JobsError(message, 'VALIDATION_ERROR', 400);
	}

	const { error: podError } = await supabase.from('proof_of_delivery').insert({
		job_id: existing.id,
		company_id: existing.company_id,
		driver_id: profile.id,
		type: 'photo',
		file_url: filePath,
		recipient_name: recipientName,
		completed_at: completedAt
	});

	if (podError) throw podError;

	const job = await completeJobForDriver(supabase, profile, jobId, completedAt);
	if (!job) {
		throw new JobsError('Job not found', 'NOT_FOUND', 404);
	}

	await notifyJobComplete(supabase, {
		companyId: job.company_id,
		jobId: job.id,
		reference: job.reference,
		driverName: profile.full_name
	});

	return job;
}

export async function getPodForJob(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string
) {
	const job = await getJobForUser(supabase, profile, jobId);
	if (!job) return null;

	const { data, error } = await supabase
		.from('proof_of_delivery')
		.select('*')
		.eq('job_id', jobId)
		.maybeSingle();

	if (error) throw error;
	return data;
}

export async function downloadPodPdf(
	_supabase: AppSupabase,
	_profile: UserProfile,
	_jobId: string
): Promise<ArrayBuffer> {
	throw new Error('Not implemented');
}
