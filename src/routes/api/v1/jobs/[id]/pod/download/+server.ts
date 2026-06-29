import type { RequestHandler } from './$types';
import { jsonNotImplemented } from '$lib/server/api/response';

/** GET /api/v1/jobs/:id/pod/download — API spec Group 5 Proof of Delivery */
export const GET: RequestHandler = async () => jsonNotImplemented();
