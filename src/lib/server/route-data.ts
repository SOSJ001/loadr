import { createAdminClient } from '$lib/server/supabase';

/** Internal route-data writes — service role only, never exposed to clients. */
export async function syncRouteDataForJob(jobId: string) {
	const supabase = createAdminClient();
	const { data: job } = await supabase.from('jobs').select('id').eq('id', jobId).single();
	return job;
}
