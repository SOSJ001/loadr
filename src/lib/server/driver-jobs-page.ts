import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchVehicleLabelsByIds } from '$lib/server/driver-job-detail';
import { listJobsForUser } from '$lib/server/jobs';
import type { Database } from '$lib/types/database';
import type { DriverJobsPageData } from '$lib/types/driver-jobs';
import type { UserProfile } from '$lib/types/user';
import { buildDriverJobsPageData, toDateKey } from '$lib/utils/driver-jobs';

type AppSupabase = SupabaseClient<Database>;

export async function fetchDriverJobsPageData(
	supabase: AppSupabase,
	profile: UserProfile,
	selectedDate?: string
): Promise<DriverJobsPageData> {
	const jobs = await listJobsForUser(supabase, profile);
	const date = selectedDate ?? toDateKey(new Date());
	const vehicleLabelsById = await fetchVehicleLabelsByIds(
		supabase,
		jobs.map((job) => job.assigned_vehicle_id).filter((id): id is string => Boolean(id))
	);

	return buildDriverJobsPageData(jobs, profile.full_name, date, vehicleLabelsById);
}
