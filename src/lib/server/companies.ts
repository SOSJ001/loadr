import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { UserProfile } from '$lib/types/user';

type AppSupabase = SupabaseClient<Database>;

/** Group 2 — Companies. */
export async function getCompanyForUser(_supabase: AppSupabase, _profile: UserProfile) {
	throw new Error('Not implemented');
}

export async function updateCompanyForUser(
	_supabase: AppSupabase,
	_profile: UserProfile,
	_payload: unknown
) {
	throw new Error('Not implemented');
}

export async function uploadCompanyLogo(
	_supabase: AppSupabase,
	_profile: UserProfile,
	_file: File
) {
	throw new Error('Not implemented');
}
