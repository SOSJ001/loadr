import type { RequestHandler } from './$types';
import { jsonNotImplemented } from '$lib/server/api/response';

/** PATCH /api/v1/notifications/read-all — API spec Group 10 Notifications */
export const PATCH: RequestHandler = async () => jsonNotImplemented();
