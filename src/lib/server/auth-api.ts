import type { SupabaseClient } from '@supabase/supabase-js';
import { findMockCompanyByNumber } from '$lib/data/mock-companies-house';
import {
	isDriverPhoneError,
	resolveDriverLoginEmail
} from '$lib/server/driver-phone';
import { isRemovedDriver, loadUserProfile } from '$lib/server/profile';
import { createAdminClient } from '$lib/server/supabase';
import type { Database } from '$lib/types/database';
import type { ApiErrorCode } from '$lib/types/api';
import { isInvalidLoginError } from '$lib/utils/error-page';

type AppSupabase = SupabaseClient<Database>;
type CompanyInsert = Database['public']['Tables']['companies']['Insert'];

export type SignupCompanyInput =
	| { mode: 'search'; companies_house_number: string }
	| { mode: 'manual'; company_name: string };

export type SignupOperatorInput = {
	email: string;
	password: string;
	company: SignupCompanyInput;
	email_redirect_to?: string;
};

export type SignupInput = {
	email: string;
	password: string;
	full_name?: string;
	email_redirect_to?: string;
};

export type LoginInput = {
	email: string;
	password: string;
};

export type LoginWithPhoneInput = {
	phone: string;
	password: string;
};

import { DRIVER_NOT_ACTIVATED_MESSAGE } from '$lib/auth/driver-messages';

export class DriverLoginError extends Error {
	constructor(
		message: string,
		public readonly code: ApiErrorCode,
		public readonly status: number
	) {
		super(message);
		this.name = 'DriverLoginError';
	}
}

export function isDriverLoginError(error: unknown): error is DriverLoginError {
	return error instanceof DriverLoginError;
}

export type ForgotPasswordInput = {
	email: string;
	redirect_to?: string;
};

export type ResetPasswordInput = {
	access_token: string;
	new_password: string;
};

export class SignupValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SignupValidationError';
	}
}

export function isSignupValidationError(error: unknown): error is SignupValidationError {
	return error instanceof SignupValidationError;
}

export function deriveFullName(email: string): string {
	const local = email.split('@')[0] ?? 'User';
	return local
		.replace(/[._-]+/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase())
		.trim();
}

function resolveCompanyRecord(company: SignupCompanyInput, email: string): CompanyInsert {
	if (company.mode === 'manual') {
		const name = company.company_name.trim();
		if (!name) {
			throw new SignupValidationError('Company name is required');
		}

		return {
			name,
			email,
			verification_status: 'pending',
			companies_house_number: null,
			registered_name: null
		};
	}

	const mockCompany = findMockCompanyByNumber(company.companies_house_number);
	if (!mockCompany) {
		throw new SignupValidationError('Selected company was not found');
	}

	if (mockCompany.status === 'dissolved') {
		throw new SignupValidationError('Cannot sign up with a dissolved company');
	}

	return {
		name: mockCompany.name,
		email,
		verification_status: 'verified',
		companies_house_number: mockCompany.number,
		registered_name: mockCompany.name
	};
}

export async function signupWithEmail(supabase: AppSupabase, input: SignupInput) {
	const { data, error } = await supabase.auth.signUp({
		email: input.email,
		password: input.password,
		options: {
			// emailRedirectTo: input.email_redirect_to, // re-enable email verification
			data: input.full_name ? { full_name: input.full_name } : undefined
		}
	});

	if (error) throw error;

	return {
		user: data.user,
		session: data.session,
		email_confirmation_required: data.session === null
	};
}

export async function signupOperator(supabase: AppSupabase, input: SignupOperatorInput) {
	const email = input.email.trim();
	const fullName = deriveFullName(email);
	const companyRecord = resolveCompanyRecord(input.company, email);

	const authResult = await signupWithEmail(supabase, {
		email,
		password: input.password,
		full_name: fullName
		// email_redirect_to: input.email_redirect_to // re-enable email verification
	});

	if (!authResult.user) {
		throw new Error('Signup failed');
	}

	const userId = authResult.user.id;
	const admin = createAdminClient();

	try {
		const { data: company, error: companyError } = await admin
			.from('companies')
			.insert(companyRecord)
			.select('id')
			.single();

		if (companyError || !company) {
			throw companyError ?? new Error('Failed to create company');
		}

		const { error: userError } = await admin.from('users').insert({
			id: userId,
			company_id: company.id,
			full_name: fullName,
			email,
			role: 'admin',
			status: 'active'
		});

		if (userError) {
			throw userError;
		}
	} catch (error) {
		await admin.auth.admin.deleteUser(userId).catch(() => {});
		throw error;
	}

	// Re-enable email verification: return authResult here and remove the TEMP block below.
	// return authResult;

	let session = authResult.session;
	let email_confirmation_required = authResult.email_confirmation_required;

	// TEMP: skip email verification — remove when re-enabling verification email flow.
	if (!session) {
		const { error: confirmError } = await admin.auth.admin.updateUserById(userId, {
			email_confirm: true
		});
		if (confirmError) throw confirmError;

		const loginData = await loginWithEmail(supabase, {
			email,
			password: input.password
		});
		session = loginData.session;
		email_confirmation_required = false;
	}

	return {
		user: authResult.user,
		session,
		email_confirmation_required
	};
}

export async function loginWithEmail(supabase: AppSupabase, input: LoginInput) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email: input.email,
		password: input.password
	});

	if (error) throw error;

	return data;
}

export async function loginWithPhone(supabase: AppSupabase, input: LoginWithPhoneInput) {
	let email: string;

	try {
		email = await resolveDriverLoginEmail(input.phone);
	} catch (err) {
		if (isDriverPhoneError(err)) {
			throw new DriverLoginError(err.message, 'VALIDATION_ERROR', 400);
		}
		throw err;
	}

	let data: Awaited<ReturnType<typeof loginWithEmail>>;

	try {
		data = await loginWithEmail(supabase, { email, password: input.password });
	} catch (err) {
		if (isInvalidLoginError(err)) {
			throw new DriverLoginError('Invalid phone or password', 'UNAUTHORISED', 401);
		}
		throw err;
	}

	const profile = await loadUserProfile(supabase, data.user.id);

	if (!profile || profile.role !== 'driver') {
		await logoutWithSession(supabase);
		throw new DriverLoginError('Invalid phone or password', 'UNAUTHORISED', 401);
	}

	if (isRemovedDriver(profile)) {
		await logoutWithSession(supabase);
		throw new DriverLoginError('Invalid phone or password', 'UNAUTHORISED', 401);
	}

	if (profile.status !== 'active') {
		await logoutWithSession(supabase);
		throw new DriverLoginError(DRIVER_NOT_ACTIVATED_MESSAGE, 'FORBIDDEN', 403);
	}

	return { data, profile };
}

export async function logoutWithSession(supabase: AppSupabase) {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}

export async function sendResetPassword(supabase: AppSupabase, input: ForgotPasswordInput) {
	const { error } = await supabase.auth.resetPasswordForEmail(input.email.trim(), {
		redirectTo: input.redirect_to
	});

	if (error) throw error;
}

export async function resetPasswordWithSession(supabase: AppSupabase, newPassword: string) {
	const { data, error } = await supabase.auth.updateUser({ password: newPassword });

	if (error) throw error;

	return data.user;
}

export async function resetPasswordWithToken(input: ResetPasswordInput) {
	const admin = createAdminClient();
	const { data: userData, error: userError } = await admin.auth.getUser(input.access_token);

	if (userError || !userData.user) {
		throw new Error('Invalid or expired token');
	}

	const { data, error } = await admin.auth.admin.updateUserById(userData.user.id, {
		password: input.new_password
	});

	if (error) throw error;

	return data.user;
}
