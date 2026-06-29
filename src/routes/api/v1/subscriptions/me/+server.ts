import type { RequestHandler } from './$types';
import { jsonNotImplemented } from '$lib/server/api/response';

/** GET /api/v1/subscriptions/me — API spec Group 9 Subscriptions */
export const GET: RequestHandler = async () => jsonNotImplemented();
