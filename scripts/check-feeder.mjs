/**
 * Print feeder wallet pubkey + devnet balance — verify this matches the address you funded.
 * Usage: node scripts/check-feeder.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import bs58 from 'bs58';
import { Connection, Keypair } from '@solana/web3.js';

function loadEnv() {
	const envPath = resolve(process.cwd(), '.env');
	const text = readFileSync(envPath, 'utf8');
	const vars = {};
	for (const line of text.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const idx = trimmed.indexOf('=');
		if (idx === -1) continue;
		vars[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
	}
	return vars;
}

function loadKeypair(secret) {
	const trimmed = secret.trim();
	let secretKey;
	if (trimmed.startsWith('[')) {
		secretKey = Uint8Array.from(JSON.parse(trimmed));
	} else {
		secretKey = bs58.decode(trimmed);
	}
	if (secretKey.length === 64) return Keypair.fromSecretKey(secretKey);
	if (secretKey.length === 32) return Keypair.fromSeed(secretKey);
	throw new Error(`Invalid secret length: ${secretKey.length}`);
}

const env = loadEnv();
const rpc = env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
const secret = env.SOLANA_FEEDER_WALLET_SECRET;

if (!secret) {
	console.error('SOLANA_FEEDER_WALLET_SECRET missing from .env');
	process.exit(1);
}

const keypair = loadKeypair(secret);
const connection = new Connection(rpc, 'confirmed');
const lamports = await connection.getBalance(keypair.publicKey);

console.log('RPC:      ', rpc);
console.log('Public key:', keypair.publicKey.toBase58());
console.log('Balance:  ', lamports / 1e9, 'SOL');
console.log('');
console.log('Fund on devnet:');
console.log(`  solana airdrop 2 ${keypair.publicKey.toBase58()} --url devnet`);
