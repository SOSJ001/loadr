import type { RequestHandler } from './$types';
import { jsonNotImplemented } from '$lib/server/api/response';

/** DELETE /api/v1/vehicles/:id — API spec Group 8 Vehicles */
export const DELETE: RequestHandler = async () => jsonNotImplemented();
