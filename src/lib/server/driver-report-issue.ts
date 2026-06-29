import type { SupabaseClient } from '@supabase/supabase-js';
import {
	requireInProgressJobForDriver,
	toDriverJobFlowContext
} from '$lib/server/driver-job-flow';
import { getJobForUser } from '$lib/server/jobs';
import { parseReportIssueFormData, reportJobIssue } from '$lib/server/issues';
import type { Database } from '$lib/types/database';
import type { DriverJobFlowContext } from '$lib/types/driver-job-flow';
import type { UserProfile } from '$lib/types/user';

type AppSupabase = SupabaseClient<Database>;
type JobRow = Database['public']['Tables']['jobs']['Row'];

export async function fetchDriverReportIssuePageData(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string
): Promise<DriverJobFlowContext> {
	const job = await requireInProgressJobForDriver(supabase, profile, jobId);
	return toDriverJobFlowContext(job);
}

export async function submitDriverReportIssue(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string,
	formData: FormData
): Promise<JobRow> {
	await requireInProgressJobForDriver(supabase, profile, jobId);
	return reportJobIssue(supabase, profile, jobId, parseReportIssueFormData(formData));
}

export async function fetchDriverReportIssueSuccessPageData(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string
): Promise<DriverJobFlowContext | null> {
	const job = await getJobForUser(supabase, profile, jobId);
	if (!job || job.status !== 'attempted') return null;

	return toDriverJobFlowContext(job);
}
