import { SOLANA_PROTOCOL } from './constants';
import { Amount, Label, Memo, Message, Recipient, References, SPLToken } from './types';

/**
 * Fields of a Solana Pay transfer request URL.
 */
export interface TransferRequestURLFields {
    /** `recipient` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#recipient). */
    recipient: Recipient;
    /** `amount` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#amount). */
    amount?: Amount;
    /** `spl-token` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#spl-token). */
    splToken?: SPLToken;
    /** `reference` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#reference). */
    reference?: References;
    /** `label` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#label). */
    label?: Label;
    /** `message` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#message).  */
    message?: Message;
    /** `memo` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#memo). */
    memo?: Memo;
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

    const params = new URLSearchParams();

    if (amount) {
        params.append('amount', amount.toFixed(amount.decimalPlaces()));
    }

    if (splToken) {
        params.append('spl-token', splToken.toBase58());
    }

    if (reference) {
        if (!Array.isArray(reference)) {
            reference = [reference];
        }

        for (const pubkey of reference) {
            params.append('reference', pubkey.toBase58());
        }
    }

    if (label) {
        params.append('label', label);
    }

    if (message) {
        params.append('message', message);
    }

    if (memo) {
        params.append('memo', memo);
    }

    const search = params.toString();
    if (search) {
        url += '?' + search;
    }

    return url;
}
