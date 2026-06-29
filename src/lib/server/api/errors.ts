import type { ApiErrorCode } from '$lib/types/api';

export type SpecErrorBody = {
	error: {
		code: ApiErrorCode;
		message: string;
		status: number;
		retry_after?: number;
	};
};

export function apiError(
	code: ApiErrorCode,
	message: string,
	status: number,
	retryAfter?: number
): SpecErrorBody {
	return {
		error: {
			code,
			message,
			status,
			...(retryAfter !== undefined ? { retry_after: retryAfter } : {})
		}
	};
}
