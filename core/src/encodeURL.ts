import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { DEFAULT_URL_PROTOCOL } from './constants';
import SupportedWallet from './supportedWallets';

/**
 * Optional query parameters to encode in a Solana Pay URL.
 */
export interface EncodeURLParams {
    /** `amount` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#amount) */
    amount?: BigNumber;
    /** `splToken` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#spl-token) */
    splToken?: PublicKey;
    /** `reference` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#reference) */
    reference?: PublicKey | PublicKey[];
    /** `label` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#label) */
    label?: string;
    /** `message` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#message)  */
    message?: string;
    /** `memo` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#memo) */
    memo?: string;
    /** `request` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#request) */
    request?: string;
    /** `recipient` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#recipient) */
    recipient?: PublicKey;
}

/**
 * Required and optional URL components to encode in a Solana Pay URL.
 */
export interface EncodeURLComponents extends EncodeURLParams {
    /** `recipient` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#recipient) */
    recipient: PublicKey;
    /** the wallet and associated address to make a request to */
    wallet?: SupportedWallet;
}

/**
 * Encode a Solana Pay URL from required and optional components.
 *
 * @param {EncodeURLComponents} components
 *
 * @param components.recipient
 * @param components.amount
 * @param components.splToken
 * @param components.reference
 * @param components.label
 * @param components.message
 * @param components.memo
 * @param components.request
 */
export function encodeURL({ recipient, wallet, ...params }: EncodeURLComponents): string {
    let url = wallet ? wallet.toString() : DEFAULT_URL_PROTOCOL + encodeURIComponent(recipient.toBase58());

    // add the recipient as a url param if there is a wallet URL
    const encodedParams = encodeURLParams({ ...params, recipient: wallet ? recipient : undefined });
    if (encodedParams) {
        url += '?' + encodedParams;
    }

    return url;
}

function encodeURLParams({
    amount,
    splToken,
    reference,
    label,
    message,
    memo,
    request,
    recipient,
}: EncodeURLParams): string {
    const params: [string, string][] = [];

    if (amount) {
        params.push(['amount', amount.toFixed(amount.decimalPlaces())]);
    }

    if (splToken) {
        params.push(['spl-token', splToken.toBase58()]);
    }

    if (reference) {
        if (!Array.isArray(reference)) {
            reference = [reference];
        }

        for (const pubkey of reference) {
            params.push(['reference', pubkey.toBase58()]);
        }
    }

    if (label) {
        params.push(['label', label]);
    }

    if (message) {
        params.push(['message', message]);
    }

    if (memo) {
        params.push(['memo', memo]);
    }

    if (request) {
        params.push(['request', request]);
    }

    if (recipient) {
        params.push(['recipient', recipient.toBase58()]);
    }

    return params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
}
