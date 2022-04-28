import { Connection } from '@solana/web3.js';
import { CLUSTER_ENDPOINT } from './env';

export const connection = new Connection(CLUSTER_ENDPOINT || 'https://api.devnet.solana.com', 'confirmed');
