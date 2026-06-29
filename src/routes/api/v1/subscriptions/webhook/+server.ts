import type { RequestHandler } from './$types';
import { jsonNotImplemented } from '$lib/server/api/response';

/** POST /api/v1/subscriptions/webhook — API spec Group 9 Subscriptions */
export const POST: RequestHandler = async () => jsonNotImplemented();
