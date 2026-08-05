import { json } from '@sveltejs/kit';
import { CRON_SECRET, SOLANA_FEEDER_WALLET_SECRET, SOLANA_RPC_URL } from '$env/static/private';
import { processBlockchainQueue } from '$lib/server/blockchain';
import type { RequestHandler } from './$types';

/** Vercel Pro allows up to 300s; Hobby caps at 10s — Solana confirm may need Pro or a faster RPC. */
export const config = {
	maxDuration: 60
};

/** GET /api/cron/blockchain — scheduled cron processor (GitHub Actions) for pending Solana writes */
export const GET: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (!SOLANA_RPC_URL || !SOLANA_FEEDER_WALLET_SECRET) {
		return json(
			{
				processed: 0,
				confirmed: 0,
				failed: 0,
				error: 'SOLANA_RPC_URL and SOLANA_FEEDER_WALLET_SECRET must be set on the deployment'
			},
			{ status: 503 }
		);
	}

	try {
		const summary = await processBlockchainQueue();
		return json(summary);
	} catch (err) {
		console.error('[loadr] blockchain cron failed:', err);
		const message = err instanceof Error ? err.message : 'Cron processing failed';
		return json({ processed: 0, confirmed: 0, failed: 0, errors: [], error: message }, { status: 500 });
	}
};
