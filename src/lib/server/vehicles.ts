import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { UserProfile } from '$lib/types/user';

type AppSupabase = SupabaseClient<Database>;

/** Group 8 — Vehicles (paid tier). */
export async function listVehiclesForCompany(_supabase: AppSupabase, _profile: UserProfile) {
	throw new Error('Not implemented');
}

export async function createVehicle(_supabase: AppSupabase, _profile: UserProfile, _payload: unknown) {
	throw new Error('Not implemented');
}

export async function deleteVehicle(_supabase: AppSupabase, _profile: UserProfile, _vehicleId: string) {
	throw new Error('Not implemented');
}
