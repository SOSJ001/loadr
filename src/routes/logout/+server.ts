import type { RequestHandler } from './$types';
import { driverLogoutAction } from '$lib/server/driver-logout';

export const POST: RequestHandler = ({ locals }) => driverLogoutAction(locals);
