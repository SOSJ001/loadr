import { json } from '@sveltejs/kit';
import { apiError } from '$lib/server/api/errors';
import type { ApiErrorCode } from '$lib/types/api';

export function jsonOk<T>(data: T, status = 200) {
	return json(data, { status });
}

export function jsonApiError(code: ApiErrorCode, message: string, status: number) {
	return json(apiError(code, message, status), { status });
}

export function jsonNotImplemented(message = 'Not implemented') {
	return jsonApiError('SERVER_ERROR', message, 501);
}
