import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { UserProfile } from '$lib/types/user';

export type AppSupabaseClient = SupabaseClient<Database>;

declare global {
	namespace App {
		interface Error {
			message: string;
		}

		interface Locals {
			supabase: AppSupabaseClient;
			session: Session | null;
			user: User | null;
			profile: UserProfile | null;
		}
	}
}

export {};
