import type { SupabaseClient } from '@supabase/supabase-js';
import { error, redirect } from '@sveltejs/kit';
import { getJobForUser } from '$lib/server/jobs';
import type { Database } from '$lib/types/database';
import type { DriverJobFlowContext } from '$lib/types/driver-job-flow';
import type { UserProfile } from '$lib/types/user';
import { formatJobReference } from '$lib/utils/driver-job-detail';

type AppSupabase = SupabaseClient<Database>;
type JobRow = Database['public']['Tables']['jobs']['Row'];

export function toDriverJobFlowContext(job: JobRow): DriverJobFlowContext {
	return {
		id: job.id,
		reference: formatJobReference(job.reference),
		pickup_address: job.pickup_address,
		dropoff_address: job.dropoff_address
	};
}

/** Loads an assigned job and redirects to job detail if it is not in progress. */
export async function requireInProgressJobForDriver(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string
): Promise<JobRow> {
	const job = await getJobForUser(supabase, profile, jobId);
	if (!job) {
		error(404, 'Not found');
	}

	if (job.status !== 'in_progress') {
		redirect(303, `/jobs/${jobId}`);
	}

	return job;
}
