import { SOLANA_RPC_URL } from '$env/static/private';

/** Solana memo writes for proof-of-delivery hashes — scaffold. */
export async function writeMemoHash(_sha256Hash: string): Promise<string | null> {
	if (!SOLANA_RPC_URL) {
		throw new Error('SOLANA_RPC_URL is not configured');
	}

	return null;
}
