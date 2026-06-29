import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { UserProfile } from '$lib/types/user';

type AppSupabase = SupabaseClient<Database>;

/** Group 9 — Subscriptions. */
export async function getSubscriptionForCompany(_supabase: AppSupabase, _profile: UserProfile) {
	throw new Error('Not implemented');
}

export async function createCheckoutSession(
	_supabase: AppSupabase,
	_profile: UserProfile,
	_payload: unknown
) {
	throw new Error('Not implemented');
}

export async function createPortalSession(_supabase: AppSupabase, _profile: UserProfile) {
	throw new Error('Not implemented');
}

export async function handleStripeWebhook(_request: Request) {
	throw new Error('Not implemented');
}
