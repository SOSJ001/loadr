import type { RequestHandler } from './$types';
import { jsonNotImplemented } from '$lib/server/api/response';

/** POST /api/v1/companies/me/logo — API spec Group 2 Companies */
export const POST: RequestHandler = async () => jsonNotImplemented();
