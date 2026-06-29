import type { RequestHandler } from './$types';
import { jsonNotImplemented } from '$lib/server/api/response';

/** GET /api/v1/companies/me — API spec Group 2 Companies */
export const GET: RequestHandler = async () => jsonNotImplemented();

/** PATCH /api/v1/companies/me — API spec Group 2 Companies */
export const PATCH: RequestHandler = async () => jsonNotImplemented();
