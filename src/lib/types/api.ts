export type ApiErrorCode =
	| 'UNAUTHORISED'
	| 'FORBIDDEN'
	| 'NOT_FOUND'
	| 'VALIDATION_ERROR'
	| 'COMPANY_NOT_VERIFIED'
	| 'DRIVER_LIMIT_REACHED'
	| 'JOB_LIMIT_REACHED'
	| 'FEATURE_LOCKED'
	| 'TOKEN_EXPIRED'
	| 'RATE_LIMIT_EXCEEDED'
	| 'SERVER_ERROR';

export type SpecErrorResponse = {
	error: {
		code: ApiErrorCode;
		message: string;
		status: number;
		retry_after?: number;
	};
};

/** @deprecated Use SpecErrorResponse for /api/v1 endpoints */
export type ApiSuccess<T> = { ok: true; data: T };

/** @deprecated Use SpecErrorResponse for /api/v1 endpoints */
export type ApiError = { ok: false; message: string };

/** @deprecated Use SpecErrorResponse for /api/v1 endpoints */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
