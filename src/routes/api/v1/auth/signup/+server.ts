import type { RequestHandler } from './$types';
import { jsonApiError, jsonOk } from '$lib/server/api/response';
import {
	isSignupValidationError,
	signupOperator,
	type SignupCompanyInput,
	type SignupOperatorInput
} from '$lib/server/auth-api';

function parseCompanyPayload(company: unknown): SignupCompanyInput | null {
	if (!company || typeof company !== 'object') return null;

	const record = company as Record<string, unknown>;
	if (record.mode === 'search') {
		if (typeof record.companies_house_number !== 'string') return null;
		return {
			mode: 'search',
			companies_house_number: record.companies_house_number
		};
	}

	if (record.mode === 'manual') {
		if (typeof record.company_name !== 'string') return null;
		return {
			mode: 'manual',
			company_name: record.company_name
		};
	}

	return null;
}

function parseSignupPayload(payload: unknown): SignupOperatorInput | null {
	if (!payload || typeof payload !== 'object') return null;

	const record = payload as Record<string, unknown>;
	if (typeof record.email !== 'string' || typeof record.password !== 'string') return null;

	const company = parseCompanyPayload(record.company);
	if (!company) return null;

	return {
		email: record.email,
		password: record.password,
		company
	};
}

/** POST /api/v1/auth/signup — API spec Group 1 Auth */
export const POST: RequestHandler = async (event) => {
	let rawPayload: unknown;

	try {
		rawPayload = await event.request.json();
	} catch {
		return jsonApiError('VALIDATION_ERROR', 'Invalid JSON body', 400);
	}

	const payload = parseSignupPayload(rawPayload);
	if (!payload) {
		return jsonApiError(
			'VALIDATION_ERROR',
			'email, password, and company (search or manual) are required',
			400
		);
	}

	if (!payload.email.trim()) {
		return jsonApiError('VALIDATION_ERROR', 'email is required', 400);
	}

	if (!payload.password) {
		return jsonApiError('VALIDATION_ERROR', 'password is required', 400);
	}

	if (payload.password.length < 8) {
		return jsonApiError('VALIDATION_ERROR', 'password must be at least 8 characters', 400);
	}

	try {
		const result = await signupOperator(event.locals.supabase, {
			email: payload.email.trim(),
			password: payload.password,
			company: payload.company
			// email_redirect_to: `${event.url.origin}/auth/callback` // re-enable email verification
		});

		return jsonOk(result, 201);
	} catch (err) {
		if (isSignupValidationError(err)) {
			return jsonApiError('VALIDATION_ERROR', err.message, 400);
		}

		const message = err instanceof Error ? err.message : 'Signup failed';
		return jsonApiError('SERVER_ERROR', message, 400);
	}
};
