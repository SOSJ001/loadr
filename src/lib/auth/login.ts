import { goto } from '$app/navigation';
import type { SpecErrorResponse } from '$lib/types/api';
import type { UserRole } from '$lib/types/user';
import { resolvePostLoginPath } from '$lib/auth/redirects';
import { SERVICE_UNAVAILABLE_MESSAGE } from '$lib/utils/error-page';

import { DRIVER_NOT_ACTIVATED_MESSAGE } from '$lib/auth/driver-messages';

export { DRIVER_NOT_ACTIVATED_MESSAGE };

export type LoginResult =
	| { ok: true }
	| { ok: false; status: number; message: string };

type LoginResponse = {
	role?: UserRole | null;
};

async function submitLogin(
	body: Record<string, string>,
	redirectParam: string | null,
	fallbackMessage: string
): Promise<LoginResult> {
	let response: Response;

	try {
		response = await fetch('/api/v1/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
	} catch {
		return { ok: false, status: 0, message: SERVICE_UNAVAILABLE_MESSAGE };
	}

	if (response.ok) {
		let role: UserRole | null = null;
		try {
			const data = (await response.json()) as LoginResponse;
			role = data.role ?? null;
		} catch {
			// Session cookies are set; fall back to default redirect.
		}

		await goto(resolvePostLoginPath(role, redirectParam), { invalidateAll: true });
		return { ok: true };
	}

	if (response.status === 401) {
		return { ok: false, status: 401, message: fallbackMessage };
	}

	if (response.status === 403) {
		let message = fallbackMessage;
		try {
			const data = (await response.json()) as SpecErrorResponse;
			if (data.error?.message) {
				message = data.error.message;
			}
		} catch {
			// keep default
		}

		return { ok: false, status: 403, message };
	}

	if (response.status >= 500) {
		let message = SERVICE_UNAVAILABLE_MESSAGE;
		try {
			const data = (await response.json()) as SpecErrorResponse;
			if (data.error?.message) {
				message = data.error.message;
			}
		} catch {
			// keep default
		}

		return { ok: false, status: response.status, message };
	}

	let message = fallbackMessage;
	try {
		const data = (await response.json()) as SpecErrorResponse;
		if (data.error?.message) {
			message = data.error.message;
		}
	} catch {
		// keep default message
	}

	return { ok: false, status: response.status, message };
}

export async function loginWithCredentials(
	email: string,
	password: string,
	redirectParam: string | null,
	fallbackMessage: string
): Promise<LoginResult> {
	return submitLogin({ email: email.trim(), password }, redirectParam, fallbackMessage);
}

export async function loginWithPhoneCredentials(
	phone: string,
	password: string,
	redirectParam: string | null,
	fallbackMessage: string
): Promise<LoginResult> {
	return submitLogin({ phone: phone.trim(), password }, redirectParam, fallbackMessage);
}
