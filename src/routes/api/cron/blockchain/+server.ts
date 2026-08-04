import { json } from '@sveltejs/kit';
import { CRON_SECRET } from '$env/static/private';
import { processBlockchainQueue } from '$lib/server/blockchain';
import type { RequestHandler } from './$types';

/** GET /api/cron/blockchain — scheduled cron processor (GitHub Actions) for pending Solana writes */
export const GET: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const summary = await processBlockchainQueue();
		return json(summary);
	} catch (err) {
		console.error('[loadr] blockchain cron failed:', err);
		return json({ processed: 0, confirmed: 0, failed: 0, error: 'Cron processing failed' });
	}
};
