import bs58 from 'bs58';
import {
	Connection,
	Keypair,
	PublicKey,
	Transaction,
	TransactionInstruction
} from '@solana/web3.js';
import { SOLANA_FEEDER_WALLET_SECRET, SOLANA_RPC_URL } from '$env/static/private';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

function loadFeederKeypair(): Keypair {
	if (!SOLANA_FEEDER_WALLET_SECRET) {
		throw new Error('SOLANA_FEEDER_WALLET_SECRET is not configured');
	}

	const secretKey = bs58.decode(SOLANA_FEEDER_WALLET_SECRET);
	return Keypair.fromSecretKey(secretKey);
}

function createRpcConnection(rpcUrl: string): Connection {
	const isNgrok = /ngrok/i.test(rpcUrl);

	return new Connection(rpcUrl, {
		commitment: 'confirmed',
		confirmTransactionInitialTimeout: 60_000,
		httpHeaders: isNgrok ? { 'ngrok-skip-browser-warning': '69420' } : undefined,
		fetch: isNgrok
			? (url, init) =>
					fetch(url, {
						...init,
						headers: {
							...init?.headers,
							'ngrok-skip-browser-warning': '69420'
						}
					})
			: undefined
	});
}

/** Write a SHA-256 hash to the Solana Memo Program. Returns the transaction signature. */
export async function writeToMemoProgram(sha256Hash: string): Promise<string> {
	if (!SOLANA_RPC_URL) {
		throw new Error('SOLANA_RPC_URL is not configured');
	}

	const connection = createRpcConnection(SOLANA_RPC_URL);
	const signer = loadFeederKeypair();

	const instruction = new TransactionInstruction({
		keys: [{ pubkey: signer.publicKey, isSigner: true, isWritable: true }],
		programId: MEMO_PROGRAM_ID,
		data: Buffer.from(sha256Hash, 'utf8')
	});

	const transaction = new Transaction().add(instruction);
	const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
	transaction.recentBlockhash = blockhash;
	transaction.lastValidBlockHeight = lastValidBlockHeight;
	transaction.feePayer = signer.publicKey;
	transaction.sign(signer);

	const signature = await connection.sendRawTransaction(transaction.serialize(), {
		skipPreflight: false,
		preflightCommitment: 'confirmed'
	});

	const { value } = await connection.confirmTransaction(
		{ signature, blockhash, lastValidBlockHeight },
		'confirmed'
	);

	if (value.err) {
		throw new Error(`Transaction failed: ${JSON.stringify(value.err)}`);
	}

	return signature;
}

/** @deprecated Use writeToMemoProgram */
export const writeMemoHash = writeToMemoProgram;
