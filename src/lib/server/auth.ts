import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { Session } from '@supabase/supabase-js';
import { jsonApiError } from '$lib/server/api/response';
import { resolveApiProfile } from '$lib/server/api/auth';
import { isRemovedDriver } from '$lib/server/profile';
import type { UserProfile } from '$lib/types/user';

export function requireSession(event: RequestEvent): Session {
	if (!event.locals.session) {
		throw new Error('Unauthorized');
	}

	return event.locals.session;
}

export function requireProfile(event: RequestEvent): UserProfile {
	if (!event.locals.profile) {
		throw new Error('Profile not found');
	}

	return event.locals.profile;
}

export function requireAdmin(event: RequestEvent): UserProfile {
	const profile = requireProfile(event);
	if (profile.role !== 'admin') {
		throw new Error('Forbidden');
	}

	return profile;
}

export function requireDriver(event: RequestEvent): UserProfile {
	const profile = requireProfile(event);
	if (profile.role !== 'driver') {
		throw new Error('Forbidden');
	}

	return profile;
}

/** Redirect non-admins away from operator-only pages. */
export function requireAdminPage(profile: UserProfile | null, redirectTo = '/jobs'): void {
	if (profile?.role !== 'admin') {
		redirect(303, redirectTo);
	}
}

/** 404 for non-drivers — never reveal that the route exists. */
export function requireDriverPage(profile: UserProfile | null): asserts profile is UserProfile {
	if (profile?.role !== 'driver') {
		error(404, 'Not found');
	}
}

/** Auth gate for shared /jobs tree — admin or driver only. */
export function requireJobsAccess(profile: UserProfile | null, loginPath = '/login'): UserProfile {
	if (!profile || (profile.role !== 'admin' && profile.role !== 'driver')) {
		redirect(303, loginPath);
	}

	if (isRemovedDriver(profile)) {
		redirect(303, loginPath);
	}

	if (profile.role === 'driver' && profile.status !== 'active') {
		redirect(303, '/activate');
	}

	return profile;
}

/**
 * Auth gate for /api/v1 job handlers — returns spec-shaped 401/403 JSON, never redirects.
 */
export function requireApiJobsAccess(event: RequestEvent): UserProfile | Response {
	const profile = resolveApiProfile(event);

	if (!profile || (profile.role !== 'admin' && profile.role !== 'driver')) {
		return jsonApiError('UNAUTHORISED', 'Authentication required', 401);
	}

	if (isRemovedDriver(profile)) {
		return jsonApiError('UNAUTHORISED', 'Authentication required', 401);
	}

	if (profile.role === 'driver' && profile.status !== 'active') {
		return jsonApiError('FORBIDDEN', 'Driver account is not active', 403);
	}

	return profile;
}

/**
 * Auth gate for /api/v1 handlers — cookie session today, Bearer JWT stub via resolveApiProfile.
 */
export function requireBearerOrCookie(event: RequestEvent): UserProfile {
	const profile = resolveApiProfile(event);
	if (!profile) {
		error(401, 'Unauthorized');
	}
	return profile;
}
