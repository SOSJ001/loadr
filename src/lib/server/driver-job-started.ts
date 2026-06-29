import type { SupabaseClient } from '@supabase/supabase-js';
import { getJobForUser } from '$lib/server/jobs';
import type { Database } from '$lib/types/database';
import type { DriverJobStartedPageData } from '$lib/types/driver-job-started';
import type { UserProfile } from '$lib/types/user';
import { buildDriverJobStartedPageData } from '$lib/utils/driver-job-started';

type AppSupabase = SupabaseClient<Database>;
type JobRow = Database['public']['Tables']['jobs']['Row'];

async function resolveStartedAt(supabase: AppSupabase, job: JobRow): Promise<string | null> {
	if (job.started_at) return job.started_at;

	const { data, error } = await supabase
		.from('job_status_history')
		.select('created_at')
		.eq('job_id', job.id)
		.eq('company_id', job.company_id)
		.eq('new_status', 'in_progress')
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error || !data) return null;

	return data.created_at;
}

export async function buildDriverJobStartedPageDataForJob(
	supabase: AppSupabase,
	job: JobRow
): Promise<DriverJobStartedPageData> {
	const startedAt = await resolveStartedAt(supabase, job);

	return buildDriverJobStartedPageData(
		startedAt && !job.started_at ? { ...job, started_at: startedAt } : job
	);
}

export async function fetchDriverJobStartedPageData(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string
): Promise<DriverJobStartedPageData | null> {
	const job = await getJobForUser(supabase, profile, jobId);
	if (!job || job.status !== 'in_progress') return null;

	return buildDriverJobStartedPageDataForJob(supabase, job);
}
