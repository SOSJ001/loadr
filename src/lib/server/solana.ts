import bs58 from 'bs58';
import {
	Connection,
	Keypair,
	PublicKey,
	SendTransactionError,
	Transaction,
	TransactionInstruction
} from '@solana/web3.js';
import { SOLANA_FEEDER_WALLET_SECRET, SOLANA_RPC_URL } from '$env/static/private';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

function decodeFeederSecret(raw: string): Uint8Array {
	const trimmed = raw.trim();

	if (trimmed.startsWith('[')) {
		const parsed: unknown = JSON.parse(trimmed);
		if (!Array.isArray(parsed)) {
			throw new Error('Feeder secret JSON must be a byte array from solana-keygen');
		}
		return Uint8Array.from(parsed as number[]);
	}

	return bs58.decode(trimmed);
}

function loadFeederKeypair(): Keypair {
	if (!SOLANA_FEEDER_WALLET_SECRET) {
		throw new Error('SOLANA_FEEDER_WALLET_SECRET is not configured');
	}

	let secretKey: Uint8Array;
	try {
		secretKey = decodeFeederSecret(SOLANA_FEEDER_WALLET_SECRET);
	} catch {
		throw new Error(
			'SOLANA_FEEDER_WALLET_SECRET must be a bs58 secret key or solana-keygen JSON byte array'
		);
	}

	if (secretKey.length === 64) {
		return Keypair.fromSecretKey(secretKey);
	}

	if (secretKey.length === 32) {
		return Keypair.fromSeed(secretKey);
	}

	throw new Error(
		`Invalid feeder secret length (${secretKey.length} bytes) — expected 64-byte keypair or 32-byte seed`
	);
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

async function formatSolanaError(err: unknown, connection: Connection): Promise<string> {
	if (err instanceof SendTransactionError) {
		try {
			const logs = await err.getLogs(connection);
			if (logs.length) {
				return `${err.message}\n${logs.join('\n')}`;
			}
		} catch {
			// fall through to base message
		}
	}

	return err instanceof Error ? err.message : String(err);
}

/** Write a SHA-256 hash to the Solana Memo Program. Returns the transaction signature. */
export async function writeToMemoProgram(sha256Hash: string): Promise<string> {
	if (!SOLANA_RPC_URL) {
		throw new Error('SOLANA_RPC_URL is not configured');
	}

	const connection = createRpcConnection(SOLANA_RPC_URL);
	const signer = loadFeederKeypair();

	const instruction = new TransactionInstruction({
		keys: [{ pubkey: signer.publicKey, isSigner: true, isWritable: false }],
		programId: MEMO_PROGRAM_ID,
		data: Buffer.from(sha256Hash, 'utf8')
	});

	const transaction = new Transaction().add(instruction);
	const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
	transaction.recentBlockhash = blockhash;
	transaction.lastValidBlockHeight = lastValidBlockHeight;
	transaction.feePayer = signer.publicKey;
	transaction.sign(signer);

	const serialized = transaction.serialize();

	try {
		const simulation = await connection.simulateTransaction(transaction);
		if (simulation.value.err) {
			const logs = simulation.value.logs?.join('\n') ?? '';
			throw new Error(
				`Simulation failed: ${JSON.stringify(simulation.value.err)}${logs ? `\n${logs}` : ''}`
			);
		}
	} catch (err) {
		if (err instanceof Error && err.message.startsWith('Simulation failed:')) {
			throw err;
		}
		throw new Error(await formatSolanaError(err, connection));
	}

	let signature: string;
	try {
		signature = await connection.sendRawTransaction(serialized, {
			skipPreflight: true,
			preflightCommitment: 'confirmed'
		});
	} catch (err) {
		throw new Error(await formatSolanaError(err, connection));
	}

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

export type SolanaFeederStatus = {
	rpc: string;
	publicKey: string;
	balanceLamports: number;
	balanceSol: number;
	ready: boolean;
};

/** Preflight check for cron — surfaces unfunded wallet / bad RPC before writes fail silently. */
export async function getSolanaFeederStatus(): Promise<SolanaFeederStatus> {
	if (!SOLANA_RPC_URL) {
		throw new Error('SOLANA_RPC_URL is not configured');
	}

	const connection = createRpcConnection(SOLANA_RPC_URL);
	const signer = loadFeederKeypair();
	const balanceLamports = await connection.getBalance(signer.publicKey);

	return {
		rpc: SOLANA_RPC_URL.replace(/^https?:\/\//, '').split('/')[0],
		publicKey: signer.publicKey.toBase58(),
		balanceLamports,
		balanceSol: balanceLamports / 1_000_000_000,
		ready: balanceLamports > 0
	};
}
