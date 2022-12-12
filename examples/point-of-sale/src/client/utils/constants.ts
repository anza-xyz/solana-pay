import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { SOLIcon } from '../components/images/SOLIcon';
import { USDCIcon } from '../components/images/USDCIcon';
import { Digits } from '../types';

export const MAX_CONFIRMATIONS = 32;

export const NON_BREAKING_SPACE = '\u00a0';

// GenesysGo's devnet endpoint doesn't retain historical transactions
export const DEVNET_ENDPOINT = clusterApiUrl('devnet');

// Use Phantom's mainnet endpoint instead of GenesysGo (auth issue) or default (ratelimits)
export const MAINNET_ENDPOINT = process.env.NEXT_PUBLIC_CLUSTER_ENDPOINT || 'https://solana-mainnet.phantom.tech';

// Mint DUMMY tokens on devnet @ https://spl-token-faucet.com
export const DEVNET_DUMMY_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

export const MAINNET_USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// Selected payment currency
export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'SOL';

// Format
// CURRENCY: [Mint address, icon tsx file, token decimals, max decimals to display, symbol]
interface currencyType {
    [key: string]: [PublicKey | undefined, React.FC<React.SVGProps<SVGSVGElement>>, Digits, Digits, string];
}
export const CURRENCY_LIST: currencyType = {
    SOL: [undefined, SOLIcon, 9, 1, 'SOL'],
    USDC: [MAINNET_USDC_MINT, USDCIcon, 6, 2, '$'],
    USDC_Dev: [DEVNET_DUMMY_MINT, USDCIcon, 6, 2, '$'],
};

// Maximum value for a payment
export const MAX_VALUE = 99999;
