import { Keypair } from '@solana/web3.js';
import base58 from 'bs58';

if (!process.env.CLUSTER_ENDPOINT) throw new Error('missing CLUSTER_ENDPOINT environment variable');
if (!process.env.SECRET_KEY) throw new Error('missing SECRET_KEY environment variable');

export const CLUSTER_ENDPOINT = process.env.CLUSTER_ENDPOINT;
export const SECRET_KEYPAIR = Keypair.fromSecretKey(base58.decode(process.env.SECRET_KEY));
export const FEE_PAYER = SECRET_KEYPAIR.publicKey;
export const RATE_LIMIT = Number(process.env.RATE_LIMIT) || undefined;
export const RATE_LIMIT_INTERVAL = Number(process.env.RATE_LIMIT_INTERVAL) || undefined;
