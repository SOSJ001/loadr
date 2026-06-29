import type { RequestHandler } from './$types';
import { jsonNotImplemented } from '$lib/server/api/response';

/** GET /api/v1/vehicles — API spec Group 8 Vehicles */
export const GET: RequestHandler = async () => jsonNotImplemented();

/** POST /api/v1/vehicles — API spec Group 8 Vehicles */
export const POST: RequestHandler = async () => jsonNotImplemented();
