import type { RequestHandler } from './$types';
import { jsonNotImplemented } from '$lib/server/api/response';

/** GET /api/v1/notifications — API spec Group 10 Notifications */
export const GET: RequestHandler = async () => jsonNotImplemented();
