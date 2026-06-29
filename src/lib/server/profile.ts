import type { PostgrestError } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { UserProfile, UserRole, UserStatus } from '$lib/types/user';

type AppSupabase = SupabaseClient<Database>;

const PROFILE_SELECT = 'id, company_id, full_name, email, phone, role, status';

type ProfileRow = {
	id: string;
	company_id: string;
	full_name: string;
	email: string;
	phone: string | null;
	role: string;
	status: string;
	removed_at?: string | null;
};

/** True when a column is absent because a migration has not been applied yet. */
export function isMissingColumn(error: PostgrestError | null, column: string): boolean {
	if (!error) return false;

	const needle = column.toLowerCase();
	const message = error.message?.toLowerCase() ?? '';
	const details = error.details?.toLowerCase() ?? '';
	const hint = error.hint?.toLowerCase() ?? '';

	return (
		error.code === '42703' ||
		error.code === 'PGRST204' ||
		message.includes(needle) ||
		details.includes(needle) ||
		hint.includes(needle)
	);
}

/** True when removed_at migration has not been applied yet. */
export function isMissingRemovedAtColumn(error: PostgrestError | null): boolean {
	return isMissingColumn(error, 'removed_at');
}

function toUserProfile(row: ProfileRow): UserProfile {
	return {
		id: row.id,
		company_id: row.company_id,
		full_name: row.full_name,
		email: row.email,
		phone: row.phone,
		role: row.role as UserRole,
		status: row.status as UserStatus,
		removed_at: row.removed_at ?? null
	};
}

/** Load session profile — tolerates DBs without removed_at migration yet. */
export async function loadUserProfile(
	supabase: AppSupabase,
	userId: string
): Promise<UserProfile | null> {
	const withRemoved = await supabase
		.from('users')
		.select(`${PROFILE_SELECT}, removed_at`)
		.eq('id', userId)
		.maybeSingle();

	if (!withRemoved.error && withRemoved.data) {
		return toUserProfile(withRemoved.data as ProfileRow);
	}

	if (withRemoved.error && !isMissingRemovedAtColumn(withRemoved.error)) {
		console.error('[loadr] profile load failed:', withRemoved.error);
		return null;
	}

	const fallback = await supabase
		.from('users')
		.select(PROFILE_SELECT)
		.eq('id', userId)
		.maybeSingle();

	if (fallback.error || !fallback.data) {
		return null;
	}

	return toUserProfile({ ...fallback.data, removed_at: null });
}

export function isRemovedDriver(profile: UserProfile): boolean {
	return profile.role === 'driver' && profile.removed_at != null;
}
