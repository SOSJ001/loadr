import { createAdminClient } from '$lib/server/supabase';
import { isMissingRemovedAtColumn } from '$lib/server/profile';

export class DriverPhoneError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DriverPhoneError';
	}
}

export function isDriverPhoneError(error: unknown): error is DriverPhoneError {
	return error instanceof DriverPhoneError;
}

export function normalizePhone(phone: string): string {
	return phone.replace(/\s+/g, '').trim();
}

/** Digit-only form for UK variant matching (07… vs 447…). */
export function phoneDigits(phone: string): string {
	return normalizePhone(phone).replace(/\D/g, '');
}

/** Candidate stored-phone values to match against the users table. */
export function phoneLookupKeys(phone: string): string[] {
	const normalized = normalizePhone(phone);
	if (!normalized) return [];

	const keys = new Set<string>([normalized]);
	const digits = phoneDigits(normalized);

	if (digits.startsWith('44') && digits.length >= 11) {
		keys.add(`0${digits.slice(2)}`);
		keys.add(`+${digits}`);
	} else if (digits.startsWith('0') && digits.length >= 10) {
		keys.add(`+44${digits.slice(1)}`);
		keys.add(`44${digits.slice(1)}`);
	}

	return [...keys];
}

export function driverSyntheticEmail(phone: string): string {
	const normalized = normalizePhone(phone);
	const local = normalized.replace(/^\+/, 'plus').replace(/[^\d]/g, '');
	if (!local) {
		throw new DriverPhoneError('A valid phone number is required');
	}
	return `${local}@drivers.loadr.internal`;
}

/** Resolve auth email for driver phone login — DB lookup first, synthetic fallback. */
export async function resolveDriverLoginEmail(phone: string): Promise<string> {
	const normalized = normalizePhone(phone);
	if (!normalized) {
		throw new DriverPhoneError('A valid phone number is required');
	}

	const keys = phoneLookupKeys(normalized);
	if (keys.length > 0) {
		const admin = createAdminClient();
		const filtered = await admin
			.from('users')
			.select('email')
			.eq('role', 'driver')
			.is('removed_at', null)
			.in('phone', keys)
			.limit(1)
			.maybeSingle();

		if (!filtered.error && filtered.data?.email) {
			return filtered.data.email;
		}

		if (filtered.error && !isMissingRemovedAtColumn(filtered.error)) {
			throw filtered.error;
		}

		const fallback = await admin
			.from('users')
			.select('email')
			.eq('role', 'driver')
			.in('phone', keys)
			.limit(1)
			.maybeSingle();

		if (fallback.error) throw fallback.error;
		if (fallback.data?.email) return fallback.data.email;
	}

	return driverSyntheticEmail(normalized);
}
