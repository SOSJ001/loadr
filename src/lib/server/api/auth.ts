import type { RequestEvent } from '@sveltejs/kit';
import type { UserProfile } from '$lib/types/user';

/**
 * Resolves the caller profile for /api/v1 handlers.
 * Cookie session (via hooks.server.ts) today; Bearer JWT parsing is a future addition.
 */
export function resolveApiProfile(event: RequestEvent): UserProfile | null {
	const authHeader = event.request.headers.get('authorization');
	if (authHeader?.startsWith('Bearer ') && !event.locals.profile) {
		// Stub: mobile Bearer auth will be wired here.
		return null;
	}

	return event.locals.profile;
}

export function getBearerToken(event: RequestEvent): string | null {
	const authHeader = event.request.headers.get('authorization');
	if (!authHeader?.startsWith('Bearer ')) return null;
	return authHeader.slice('Bearer '.length).trim();
}
