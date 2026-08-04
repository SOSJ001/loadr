import { createAdminClient } from '$lib/server/supabase';
import type { Database } from '$lib/types/database';

type BlockchainReferenceType = Database['public']['Tables']['blockchain_receipts']['Row']['reference_type'];

const MAX_RETRIES = 3;
const BATCH_LIMIT = 20;

export type BlockchainQueueSummary = {
	processed: number;
	confirmed: number;
	failed: number;
};

/** Queue a hash for async Solana write — never blocks on chain submission. */
export async function queueBlockchainWrite(
	referenceType: BlockchainReferenceType,
	referenceId: string,
	sha256Hash: string,
	companyId: string
): Promise<string> {
	const admin = createAdminClient();

	const { data, error } = await admin
		.from('blockchain_receipts')
		.insert({
			company_id: companyId,
			reference_type: referenceType,
			reference_id: referenceId,
			sha256_hash: sha256Hash,
			status: 'pending',
			retry_count: 0
		})
		.select('id')
		.single();

	if (error) throw error;
	return data.id;
}

async function confirmReference(
	referenceType: BlockchainReferenceType,
	referenceId: string,
	sha256Hash: string
): Promise<void> {
	const admin = createAdminClient();

	if (referenceType === 'proof_of_delivery') {
		const { error } = await admin
			.from('proof_of_delivery')
			.update({
				blockchain_confirmed: true,
				blockchain_hash: sha256Hash
			})
			.eq('id', referenceId);

		if (error) throw error;
		return;
	}

	const { error } = await admin
		.from('route_data')
		.update({
			blockchain_confirmed: true,
			blockchain_hash: sha256Hash
		})
		.eq('id', referenceId);

	if (error) throw error;
}

/** Background processor — fetch pending receipts and write to Solana. */
export async function processBlockchainQueue(): Promise<BlockchainQueueSummary> {
	const admin = createAdminClient();
	const summary: BlockchainQueueSummary = { processed: 0, confirmed: 0, failed: 0 };

	const { data: pending, error } = await admin
		.from('blockchain_receipts')
		.select('*')
		.eq('status', 'pending')
		.lt('retry_count', MAX_RETRIES)
		.order('created_at', { ascending: true })
		.limit(BATCH_LIMIT);

	if (error) throw error;
	if (!pending?.length) return summary;

	for (const receipt of pending) {
		summary.processed += 1;

		try {
			const { writeToMemoProgram } = await import('$lib/server/solana');
			const signature = await writeToMemoProgram(receipt.sha256_hash);
			const confirmedAt = new Date().toISOString();

			const { error: updateError } = await admin
				.from('blockchain_receipts')
				.update({
					status: 'confirmed',
					solana_transaction_id: signature,
					confirmed_at: confirmedAt
				})
				.eq('id', receipt.id);

			if (updateError) throw updateError;

			await confirmReference(receipt.reference_type, receipt.reference_id, receipt.sha256_hash);
			summary.confirmed += 1;
		} catch (err) {
			const nextRetry = receipt.retry_count + 1;
			const failed = nextRetry >= MAX_RETRIES;

			console.error('[loadr] blockchain write failed:', receipt.id, err);

			const { error: retryError } = await admin
				.from('blockchain_receipts')
				.update({
					retry_count: nextRetry,
					status: failed ? 'failed' : 'pending'
				})
				.eq('id', receipt.id);

			if (retryError) {
				console.error('[loadr] blockchain retry update failed:', receipt.id, retryError);
			}

			if (failed) summary.failed += 1;
		}
	}

	return summary;
}

/** @deprecated Use queueBlockchainWrite + processBlockchainQueue */
export async function writePodToBlockchain(_proofOfDeliveryId: string) {
	throw new Error('Use queueBlockchainWrite and processBlockchainQueue');
}

export async function writeRouteToBlockchain(_routeDataId: string) {
	throw new Error('Not implemented');
}

export async function getBlockchainReceiptStatus(receiptId: string) {
	const admin = createAdminClient();
	const { data, error } = await admin
		.from('blockchain_receipts')
		.select('*')
		.eq('id', receiptId)
		.maybeSingle();

	if (error) throw error;
	return data;
}
