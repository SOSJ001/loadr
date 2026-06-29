import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type {
	OperatorJobDriverOption,
	OperatorJobListRow,
	OperatorJobsPageData,
	OperatorJobStats
} from '$lib/types/operator-jobs';
import type { UserProfile } from '$lib/types/user';
import { listJobsForUser } from '$lib/server/jobs';
import { listAssignableDriversForCompany, listDriversForCompany } from '$lib/server/users';

type AppSupabase = SupabaseClient<Database>;

function formatJobReference(reference: string) {
	return reference.startsWith('#') ? reference : `#${reference}`;
}

function buildStats(jobs: Database['public']['Tables']['jobs']['Row'][]): OperatorJobStats {
	return {
		pending: jobs.filter((job) => job.status === 'pending').length,
		inProgress: jobs.filter((job) => job.status === 'in_progress').length,
		complete: jobs.filter((job) => job.status === 'complete').length,
		attempted: jobs.filter((job) => job.status === 'attempted').length
	};
}

export async function buildOperatorJobsPageData(
	supabase: AppSupabase,
	profile: UserProfile
): Promise<OperatorJobsPageData> {
	const [jobs, drivers, assignableDrivers] = await Promise.all([
		listJobsForUser(supabase, profile),
		listDriversForCompany(supabase, profile),
		listAssignableDriversForCompany(supabase, profile)
	]);

	const driverNames = new Map(drivers.map((driver) => [driver.id, driver.full_name]));

	const rows: OperatorJobListRow[] = jobs.map((job) => ({
		id: job.id,
		reference: formatJobReference(job.reference),
		pickup_address: job.pickup_address,
		dropoff_address: job.dropoff_address,
		driver_id: job.assigned_driver_id,
		driver_name: job.assigned_driver_id
			? (driverNames.get(job.assigned_driver_id) ?? null)
			: null,
		status: job.status,
		scheduled_at: job.scheduled_at
	}));

	const driverOptions: OperatorJobDriverOption[] = assignableDrivers.map((driver) => ({
		id: driver.id,
		full_name: driver.full_name
	}));

	return {
		jobs: rows,
		stats: buildStats(jobs),
		drivers: driverOptions
	};
}
