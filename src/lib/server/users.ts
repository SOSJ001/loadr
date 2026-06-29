import type { SupabaseClient } from '@supabase/supabase-js';
import { driverSyntheticEmail, isDriverPhoneError, normalizePhone, phoneLookupKeys } from '$lib/server/driver-phone';
import { createAdminClient } from '$lib/server/supabase';
import { sendDriverInviteSms } from '$lib/server/twilio';
import type { Database } from '$lib/types/database';
import type { ApiErrorCode } from '$lib/types/api';
import type { UserProfile } from '$lib/types/user';
import { isMissingRemovedAtColumn } from '$lib/server/profile';

type AppSupabase = SupabaseClient<Database>;
type DriverRow = Database['public']['Tables']['users']['Row'];

const FREE_DRIVER_LIMIT = 3;
export { FREE_DRIVER_LIMIT };

const INVITE_EXPIRY_HOURS = 48;

export type InviteDriverInput = {
	full_name: string;
	phone: string;
	activate_base_url: string;
};

export class UsersError extends Error {
	constructor(
		message: string,
		public readonly code: ApiErrorCode,
		public readonly status = 400
	) {
		super(message);
		this.name = 'UsersError';
	}
}

export function isUsersError(error: unknown): error is UsersError {
	return error instanceof UsersError;
}

function assertAdmin(profile: UserProfile): void {
	if (profile.role !== 'admin') {
		throw new UsersError('Forbidden', 'FORBIDDEN', 403);
	}
}

function generateInviteToken(): string {
	return crypto.randomUUID();
}

function inviteExpiresAt(): string {
	const expires = new Date();
	expires.setHours(expires.getHours() + INVITE_EXPIRY_HOURS);
	return expires.toISOString();
}

function generateTempPassword(): string {
	return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

async function countCompanyDrivers(
	supabase: AppSupabase,
	companyId: string,
	activeOnly: boolean
): Promise<number> {
	if (activeOnly) {
		const filtered = await supabase
			.from('users')
			.select('id', { count: 'exact', head: true })
			.eq('company_id', companyId)
			.eq('role', 'driver')
			.is('removed_at', null);

		if (!filtered.error) return filtered.count ?? 0;

		const fallback = await supabase
			.from('users')
			.select('id', { count: 'exact', head: true })
			.eq('company_id', companyId)
			.eq('role', 'driver');

		if (!fallback.error) return fallback.count ?? 0;

		throw filtered.error;
	}

	const { count, error } = await supabase
		.from('users')
		.select('id', { count: 'exact', head: true })
		.eq('company_id', companyId)
		.eq('role', 'driver');

	if (error) throw error;
	return count ?? 0;
}

async function listCompanyDrivers(
	supabase: AppSupabase,
	companyId: string,
	activeOnly: boolean
): Promise<DriverRow[]> {
	if (activeOnly) {
		const filtered = await supabase
			.from('users')
			.select('*')
			.eq('company_id', companyId)
			.eq('role', 'driver')
			.is('removed_at', null)
			.order('created_at', { ascending: false });

		if (!filtered.error) return filtered.data ?? [];

		const fallback = await supabase
			.from('users')
			.select('*')
			.eq('company_id', companyId)
			.eq('role', 'driver')
			.order('created_at', { ascending: false });

		if (!fallback.error) return fallback.data ?? [];

		throw filtered.error;
	}

	const { data, error } = await supabase
		.from('users')
		.select('*')
		.eq('company_id', companyId)
		.eq('role', 'driver')
		.order('created_at', { ascending: false });

	if (error) throw error;
	return data ?? [];
}

async function getCompanyDriverById(
	supabase: AppSupabase,
	companyId: string,
	driverId: string,
	activeOnly: boolean
): Promise<DriverRow | null> {
	if (activeOnly) {
		const filtered = await supabase
			.from('users')
			.select('*')
			.eq('id', driverId)
			.eq('company_id', companyId)
			.eq('role', 'driver')
			.is('removed_at', null)
			.maybeSingle();

		if (!filtered.error) return filtered.data;

		const fallback = await supabase
			.from('users')
			.select('*')
			.eq('id', driverId)
			.eq('company_id', companyId)
			.eq('role', 'driver')
			.maybeSingle();

		if (!fallback.error) return fallback.data;

		throw filtered.error;
	}

	const { data, error } = await supabase
		.from('users')
		.select('*')
		.eq('id', driverId)
		.eq('company_id', companyId)
		.eq('role', 'driver')
		.maybeSingle();

	if (error) throw error;
	return data;
}

/** Active driver in company — null if missing, pending, removed, or wrong company. */
export async function getAssignableDriver(
	supabase: AppSupabase,
	companyId: string,
	driverId: string
): Promise<DriverRow | null> {
	const driver = await getCompanyDriverById(supabase, companyId, driverId, true);
	if (!driver || driver.status !== 'active') return null;
	return driver;
}

/** Active (non-removed) driver count for a company. */
export async function countActiveCompanyDrivers(
	supabase: AppSupabase,
	companyId: string
): Promise<number> {
	return countCompanyDrivers(supabase, companyId, true);
}

async function findActiveDriverByPhone(
	supabase: AppSupabase,
	companyId: string,
	phoneKeys: string[]
): Promise<{ id: string } | null> {
	const filtered = await supabase
		.from('users')
		.select('id')
		.eq('company_id', companyId)
		.eq('role', 'driver')
		.is('removed_at', null)
		.in('phone', phoneKeys)
		.maybeSingle();

	if (!filtered.error) return filtered.data;

	if (isMissingRemovedAtColumn(filtered.error)) {
		const fallback = await supabase
			.from('users')
			.select('id')
			.eq('company_id', companyId)
			.eq('role', 'driver')
			.in('phone', phoneKeys)
			.maybeSingle();

		if (fallback.error) throw fallback.error;
		return fallback.data;
	}

	throw filtered.error;
}

async function findRemovedDriverByPhone(
	supabase: AppSupabase,
	companyId: string,
	phoneKeys: string[]
): Promise<{ id: string; email: string } | null> {
	const filtered = await supabase
		.from('users')
		.select('id, email')
		.eq('company_id', companyId)
		.eq('role', 'driver')
		.not('removed_at', 'is', null)
		.in('phone', phoneKeys)
		.maybeSingle();

	if (!filtered.error) return filtered.data;

	if (isMissingRemovedAtColumn(filtered.error)) {
		return null;
	}

	throw filtered.error;
}

async function assertCompanyCanInviteDrivers(
	supabase: AppSupabase,
	companyId: string
): Promise<{ plan: string }> {
	const { data: company, error } = await supabase
		.from('companies')
		.select('plan, verification_status')
		.eq('id', companyId)
		.single();

	if (error || !company) {
		throw new UsersError('Company not found', 'NOT_FOUND', 404);
	}

	if (company.verification_status !== 'verified') {
		throw new UsersError(
			'Company must be verified before inviting drivers',
			'COMPANY_NOT_VERIFIED',
			403
		);
	}

	return { plan: company.plan };
}

async function assertDriverCapacity(
	supabase: AppSupabase,
	companyId: string,
	plan: string
): Promise<void> {
	if (plan !== 'free') return;

	const count = await countCompanyDrivers(supabase, companyId, true);

	if (count >= FREE_DRIVER_LIMIT) {
		throw new UsersError(
			`Free plan allows up to ${FREE_DRIVER_LIMIT} drivers`,
			'DRIVER_LIMIT_REACHED',
			403
		);
	}
}

async function getDriverRowForCompany(
	supabase: AppSupabase,
	profile: UserProfile,
	driverId: string
): Promise<DriverRow | null> {
	return getCompanyDriverById(supabase, profile.company_id, driverId, true);
}

/** Drivers for the operator company. */
export async function listDriversForCompany(
	supabase: AppSupabase,
	profile: UserProfile
): Promise<DriverRow[]> {
	assertAdmin(profile);

	return listCompanyDrivers(supabase, profile.company_id, true);
}

/** Active drivers only — for job assignment dropdowns. */
export async function listAssignableDriversForCompany(
	supabase: AppSupabase,
	profile: UserProfile
): Promise<DriverRow[]> {
	assertAdmin(profile);

	const filtered = await supabase
		.from('users')
		.select('*')
		.eq('company_id', profile.company_id)
		.eq('role', 'driver')
		.eq('status', 'active')
		.is('removed_at', null)
		.order('full_name', { ascending: true });

	if (!filtered.error) return filtered.data ?? [];

	if (isMissingRemovedAtColumn(filtered.error)) {
		const fallback = await supabase
			.from('users')
			.select('*')
			.eq('company_id', profile.company_id)
			.eq('role', 'driver')
			.eq('status', 'active')
			.order('full_name', { ascending: true });

		if (fallback.error) throw fallback.error;
		return fallback.data ?? [];
	}

	throw filtered.error;
}

/** Create auth user at invite time, insert pending driver row, send SMS. */
export async function inviteDriver(
	supabase: AppSupabase,
	profile: UserProfile,
	input: InviteDriverInput
): Promise<DriverRow> {
	assertAdmin(profile);

	const fullName = input.full_name.trim();
	const phone = normalizePhone(input.phone);

	if (!fullName) {
		throw new UsersError('Full name is required', 'VALIDATION_ERROR', 400);
	}
	if (!phone) {
		throw new UsersError('Phone number is required', 'VALIDATION_ERROR', 400);
	}

	const { plan } = await assertCompanyCanInviteDrivers(supabase, profile.company_id);
	await assertDriverCapacity(supabase, profile.company_id, plan);

	const keys = phoneLookupKeys(phone);
	if (keys.length > 0) {
		const activeDriver = await findActiveDriverByPhone(supabase, profile.company_id, keys);

		if (activeDriver) {
			throw new UsersError(
				'A driver with this mobile number already exists',
				'VALIDATION_ERROR',
				400
			);
		}

		const removedDriver = await findRemovedDriverByPhone(supabase, profile.company_id, keys);

		if (removedDriver) {
			return reactivateRemovedDriver(supabase, {
				driverId: removedDriver.id,
				fullName,
				phone,
				activateBaseUrl: input.activate_base_url
			});
		}
	}

	let email: string;
	try {
		email = driverSyntheticEmail(phone);
	} catch (err) {
		if (isDriverPhoneError(err)) {
			throw new UsersError(err.message, 'VALIDATION_ERROR', 400);
		}
		throw err;
	}
	const inviteToken = generateInviteToken();
	const inviteExpiresAtValue = inviteExpiresAt();
	const tempPassword = generateTempPassword();
	const admin = createAdminClient();

	const { data: authData, error: authError } = await admin.auth.admin.createUser({
		email,
		password: tempPassword,
		email_confirm: true,
		user_metadata: { full_name: fullName }
	});

	if (authError || !authData.user) {
		throw authError ?? new UsersError('Failed to create driver account', 'SERVER_ERROR', 500);
	}

	const userId = authData.user.id;

	try {
		const { data: driver, error: insertError } = await supabase
			.from('users')
			.insert({
				id: userId,
				company_id: profile.company_id,
				full_name: fullName,
				email,
				phone,
				role: 'driver',
				status: 'pending',
				invite_token: inviteToken,
				invite_expires_at: inviteExpiresAtValue
			})
			.select('*')
			.single();

		if (insertError || !driver) {
			throw insertError ?? new UsersError('Failed to save driver invite', 'SERVER_ERROR', 500);
		}

		// Re-check after insert — closes a narrow race if two invites run at once on free plan.
		if (plan === 'free') {
			const count = await countCompanyDrivers(supabase, profile.company_id, true);

			if (count > FREE_DRIVER_LIMIT) {
				await supabase.from('users').delete().eq('id', userId);
				throw new UsersError(
					`Free plan allows up to ${FREE_DRIVER_LIMIT} drivers`,
					'DRIVER_LIMIT_REACHED',
					403
				);
			}
		}

		const activateUrl = new URL('/activate', input.activate_base_url);
		activateUrl.searchParams.set('token', inviteToken);
		await sendDriverInviteSms(phone, activateUrl.toString());

		return driver;
	} catch (error) {
		await admin.auth.admin.deleteUser(userId).catch(() => {});
		throw error;
	}
}

async function reactivateRemovedDriver(
	supabase: AppSupabase,
	input: {
		driverId: string;
		fullName: string;
		phone: string;
		activateBaseUrl: string;
	}
): Promise<DriverRow> {
	const admin = createAdminClient();
	const inviteToken = generateInviteToken();
	const inviteExpiresAtValue = inviteExpiresAt();
	const tempPassword = generateTempPassword();

	await admin.auth.admin.updateUserById(input.driverId, {
		ban_duration: 'none',
		password: tempPassword
	});

	const { data: driver, error } = await supabase
		.from('users')
		.update({
			removed_at: null,
			status: 'pending',
			full_name: input.fullName,
			phone: input.phone,
			invite_token: inviteToken,
			invite_expires_at: inviteExpiresAtValue
		})
		.eq('id', input.driverId)
		.select('*')
		.single();

	if (error) throw error;

	const activateUrl = new URL('/activate', input.activateBaseUrl);
	activateUrl.searchParams.set('token', inviteToken);
	await sendDriverInviteSms(input.phone, activateUrl.toString());

	return driver;
}

export async function getDriverForCompany(
	supabase: AppSupabase,
	profile: UserProfile,
	driverId: string
): Promise<DriverRow | null> {
	assertAdmin(profile);
	return getDriverRowForCompany(supabase, profile, driverId);
}

/** Soft-remove driver — row kept for job history; auth access revoked. */
export async function removeDriver(
	supabase: AppSupabase,
	profile: UserProfile,
	driverId: string,
	confirmText?: string
): Promise<boolean> {
	assertAdmin(profile);

	const existing = await getDriverRowForCompany(supabase, profile, driverId);
	if (!existing) return false;

	if (confirmText !== undefined) {
		const expected = `delete ${existing.full_name}`;
		if (confirmText !== expected) {
			throw new UsersError('Confirmation text does not match.', 'VALIDATION_ERROR', 400);
		}
	}

	const removedAt = new Date().toISOString();
	const { data, error } = await supabase
		.from('users')
		.update({
			removed_at: removedAt,
			invite_token: null,
			invite_expires_at: null
		})
		.eq('id', driverId)
		.eq('company_id', profile.company_id)
		.eq('role', 'driver')
		.is('removed_at', null)
		.select('id')
		.maybeSingle();

	if (error) {
		if (isMissingRemovedAtColumn(error)) {
			throw new UsersError(
				'Driver removal requires a database update. Run: supabase db push',
				'SERVER_ERROR',
				503
			);
		}
		throw error;
	}
	if (!data) return false;

	const admin = createAdminClient();
	await admin.auth.admin.signOut(driverId, 'global').catch(() => {});
	await admin.auth.admin.updateUserById(driverId, { ban_duration: '876000h' }).catch(() => {});

	return true;
}

export async function resendInvite(
	supabase: AppSupabase,
	profile: UserProfile,
	driverId: string,
	activateBaseUrl: string
): Promise<DriverRow | null> {
	assertAdmin(profile);

	const existing = await getDriverRowForCompany(supabase, profile, driverId);
	if (!existing) return null;

	if (existing.status !== 'pending') {
		throw new UsersError('Invite can only be resent for pending drivers', 'VALIDATION_ERROR', 400);
	}

	if (!existing.phone) {
		throw new UsersError('Driver has no phone number on file', 'VALIDATION_ERROR', 400);
	}

	await assertCompanyCanInviteDrivers(supabase, profile.company_id);

	const inviteToken = generateInviteToken();
	const inviteExpiresAtValue = inviteExpiresAt();

	const { data: driver, error } = await supabase
		.from('users')
		.update({
			invite_token: inviteToken,
			invite_expires_at: inviteExpiresAtValue
		})
		.eq('id', driverId)
		.select('*')
		.single();

	if (error) throw error;

	const activateUrl = new URL('/activate', activateBaseUrl);
	activateUrl.searchParams.set('token', inviteToken);
	await sendDriverInviteSms(existing.phone, activateUrl.toString());

	return driver;
}

export type ActivateDriverResult = {
	userId: string;
	email: string;
};

export type DriverInvitePreview = {
	companyName: string;
	inviteExpiresAt: string | null;
	fullName: string;
};

/** Public invite landing data for /activate (token from SMS link). */
export async function getDriverInvitePreview(token: string): Promise<DriverInvitePreview | null> {
	const trimmedToken = token.trim();
	if (!trimmedToken) return null;

	const admin = createAdminClient();

	const { data: driver, error } = await admin
		.from('users')
		.select('full_name, status, invite_expires_at, company_id, removed_at')
		.eq('invite_token', trimmedToken)
		.eq('role', 'driver')
		.maybeSingle();

	let resolvedDriver = driver;
	if (error && isMissingRemovedAtColumn(error)) {
		const fallback = await admin
			.from('users')
			.select('full_name, status, invite_expires_at, company_id')
			.eq('invite_token', trimmedToken)
			.eq('role', 'driver')
			.maybeSingle();
		if (fallback.error) throw fallback.error;
		resolvedDriver = fallback.data ? { ...fallback.data, removed_at: null } : null;
	} else if (error) {
		throw error;
	}

	if (!resolvedDriver) return null;

	if (resolvedDriver.removed_at) {
		throw new UsersError('This activation link is no longer valid', 'NOT_FOUND', 404);
	}

	if (resolvedDriver.status !== 'pending') {
		throw new UsersError('This account is already active', 'VALIDATION_ERROR', 400);
	}

	const { data: company, error: companyError } = await admin
		.from('companies')
		.select('name')
		.eq('id', resolvedDriver.company_id)
		.single();

	if (companyError) throw companyError;

	return {
		companyName: company.name,
		inviteExpiresAt: resolvedDriver.invite_expires_at,
		fullName: resolvedDriver.full_name
	};
}

/** Validate invite token, set password, mark driver active. */
export async function activateDriver(token: string, password: string): Promise<ActivateDriverResult> {
	const trimmedToken = token.trim();
	if (!trimmedToken) {
		throw new UsersError('Activation token is required', 'VALIDATION_ERROR', 400);
	}
	if (!password || password.length < 8) {
		throw new UsersError('Password must be at least 8 characters', 'VALIDATION_ERROR', 400);
	}

	const admin = createAdminClient();

	const { data: driver, error } = await admin
		.from('users')
		.select('id, email, status, invite_expires_at, removed_at')
		.eq('invite_token', trimmedToken)
		.eq('role', 'driver')
		.maybeSingle();

	let resolvedDriver = driver;
	if (error && isMissingRemovedAtColumn(error)) {
		const fallback = await admin
			.from('users')
			.select('id, email, status, invite_expires_at')
			.eq('invite_token', trimmedToken)
			.eq('role', 'driver')
			.maybeSingle();
		if (fallback.error) throw fallback.error;
		resolvedDriver = fallback.data ? { ...fallback.data, removed_at: null } : null;
	} else if (error) {
		throw error;
	}

	if (!resolvedDriver) {
		throw new UsersError('Invalid activation link', 'NOT_FOUND', 404);
	}

	if (resolvedDriver.removed_at) {
		throw new UsersError('This activation link is no longer valid', 'NOT_FOUND', 404);
	}

	if (resolvedDriver.status !== 'pending') {
		throw new UsersError('This account is already active', 'VALIDATION_ERROR', 400);
	}

	if (resolvedDriver.invite_expires_at && new Date(resolvedDriver.invite_expires_at) < new Date()) {
		throw new UsersError('This activation link has expired', 'TOKEN_EXPIRED', 410);
	}

	const { error: passwordError } = await admin.auth.admin.updateUserById(resolvedDriver.id, {
		password,
		ban_duration: 'none'
	});

	if (passwordError) {
		throw passwordError;
	}

	const { error: updateError } = await admin
		.from('users')
		.update({
			status: 'active',
			invite_token: null,
			invite_expires_at: null
		})
		.eq('id', resolvedDriver.id);

	if (updateError) throw updateError;

	return { userId: resolvedDriver.id, email: resolvedDriver.email };
}
