import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { SOLANA_PROTOCOL } from './constants';

/**
 * Fields to encode in a Solana Pay transfer request URL.
 */
export interface TransferRequestURLFields {
    /** `recipient` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#recipient). */
    recipient: PublicKey;
    /** `amount` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#amount). */
    amount?: BigNumber;
    /** `splToken` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#spl-token). */
    splToken?: PublicKey;
    /** `reference` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#reference). */
    reference?: PublicKey | PublicKey[];
    /** `label` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#label). */
    label?: string;
    /** `message` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#message).  */
    message?: string;
    /** `memo` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#memo). */
    memo?: string;
}

/**
 * Encode a Solana Pay transfer request URL.
 *
 * @param fields Fields to encode in the URL.
 */
export function encodeTransferRequestURL({
    recipient,
    amount,
    splToken,
    reference,
    label,
    message,
    memo,
}: TransferRequestURLFields): string {
    let url = SOLANA_PROTOCOL + encodeURIComponent(recipient.toBase58());

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

    if (params.length) {
        url += '?' + params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
    }

    return url;
}
