import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { SOLIcon } from '../components/images/SOLIcon';
import { USDCIcon } from '../components/images/USDCIcon';
import { USDTIcon } from '../components/images/USDTIcon';
import { EURIcon } from '../components/images/EURIcon';
import { agEURIcon } from '../components/images/agEURIcon';
import { Digits } from '../types';

export const MAX_CONFIRMATIONS = 32;

export const NON_BREAKING_SPACE = '\u00a0';

// GenesysGo's devnet endpoint doesn't retain historical transactions
export const DEVNET_ENDPOINT = clusterApiUrl('devnet');

// Use Phantom's mainnet endpoint instead of GenesysGo (auth issue) or default (ratelimits)
export const MAINNET_ENDPOINT = process.env.NEXT_PUBLIC_CLUSTER_ENDPOINT || 'https://solana-mainnet.rpc.extrnode.com';

// Mint DUMMY tokens on devnet @ https://spl-token-faucet.com
export const DEVNET_DUMMY_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

export const MAINNET_USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
export const MAINNET_USDT_MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
export const MAINNET_EUR_MINT = new PublicKey('Pnsjp9dbenPeFZWqqPHDygzkCZ4Gr37G8mgdRK2KjQp');
export const MAINNET_AGEUR_MINT = new PublicKey('CbNYA9n3927uXUukee2Hf4tm3xxkffJPPZvGazc2EAH1');

// Format
// CURRENCY: [Mint address, icon tsx file, token decimals, max decimals to display, symbol]
interface currencyType {
    [key: string]: [PublicKey | undefined, React.FC<React.SVGProps<SVGSVGElement>>, Digits, Digits, string];
}
export const CURRENCY_LIST: currencyType = {
    SOL: [undefined, SOLIcon, 9, 1, 'SOL'],
    EUR: [MAINNET_EUR_MINT, EURIcon, 9, 2, 'EUR'],
    agEUR: [MAINNET_AGEUR_MINT, agEURIcon, 8, 2, 'EUR'],
    USDC: [MAINNET_USDC_MINT, USDCIcon, 6, 2, 'USD'],
    USDC_Dev: [DEVNET_DUMMY_MINT, USDCIcon, 6, 2, 'USD'],
    USDT: [MAINNET_USDT_MINT, USDTIcon, 6, 2, 'USD'],
};

// Maximum value for a payment
export const MAX_VALUE = 99999;
