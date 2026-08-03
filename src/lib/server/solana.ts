import bs58 from 'bs58';
import {
	Connection,
	Keypair,
	PublicKey,
	Transaction,
	TransactionInstruction,
	sendAndConfirmTransaction
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

/** Write a SHA-256 hash to the Solana Memo Program. Returns the transaction signature. */
export async function writeToMemoProgram(sha256Hash: string): Promise<string> {
	if (!SOLANA_RPC_URL) {
		throw new Error('SOLANA_RPC_URL is not configured');
	}

	const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
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

	return sendAndConfirmTransaction(connection, transaction, [signer], {
		commitment: 'confirmed'
	});
}

/** @deprecated Use writeToMemoProgram */
export const writeMemoHash = writeToMemoProgram;
