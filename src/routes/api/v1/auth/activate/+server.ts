import type { RequestHandler } from './$types';
import { jsonNotImplemented } from '$lib/server/api/response';

/** POST /api/v1/auth/activate — API spec Group 1 Auth */
export const POST: RequestHandler = async () => jsonNotImplemented();
