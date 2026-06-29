import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { UserProfile } from '$lib/types/user';
import { listAssignableDriversForCompany } from '$lib/server/users';

type AppSupabase = SupabaseClient<Database>;

export type EditJobDriverOption = {
	id: string;
	full_name: string;
};

/** Includes the job's current driver even if they are no longer assignable. */
export async function buildEditJobDriverOptions(
	supabase: AppSupabase,
	profile: UserProfile,
	assignedDriverId: string | null
): Promise<EditJobDriverOption[]> {
	const rows = await listAssignableDriversForCompany(supabase, profile);
	const drivers: EditJobDriverOption[] = rows.map((driver) => ({
		id: driver.id,
		full_name: driver.full_name
	}));

	if (!assignedDriverId || drivers.some((driver) => driver.id === assignedDriverId)) {
		return drivers;
	}

	const { data, error } = await supabase
		.from('users')
		.select('id, full_name')
		.eq('id', assignedDriverId)
		.eq('company_id', profile.company_id)
		.maybeSingle();

	if (error) throw error;

	if (data) {
		drivers.push({ id: data.id, full_name: data.full_name });
		drivers.sort((a, b) => a.full_name.localeCompare(b.full_name));
	}

	return drivers;
}
