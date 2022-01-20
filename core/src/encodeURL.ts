import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export interface EncodeURLParams {
    /** The amount of SOL or SPL token that should be transferred. It  is always interpreted to be a decimal number of "user" units */
    amount?: BigNumber;
    /** The mint address of the SPL token */
    token?: PublicKey;
    /** An array of public keys used to identify this transaction */
    reference?: PublicKey | PublicKey[];
    /** A label to be used by the wallet provider to identify this transaction */
    label?: string;
    /** A message to be used by the wallet provider to identify this transaction */
    message?: string;
    /** Creates an additional transaction for the [Memo Program](https://spl.solana.com/memo) */
    memo?: string;
}

export interface EncodeURLComponents extends EncodeURLParams {
    /** The address the payment should be made to. It **must** be a native SOL address. */
    recipient: PublicKey;
}

/**
 * Encode params into URL
 *
 * @param {EncodeURLComponents} encodeURLParams
 *
 * @param encodeURLParams.recipient - The address the payment should be made to. It **must** be a native SOL address.
 * @param encodeURLParams.amount - The amount of SOL or SPL token that should be transferred. It  is always interpreted to be a decimal number of "user" units. If `null` the user will be requested to enter an amount by the wallet provider.
 * @param encodeURLParams.token - The mint address of the SPL token. If `null` the transaction will be for native SOL
 * @param encodeURLParams.reference - An array of public keys used to identify this transaction. They are the **only** way you'll be able to ensure that the customer has completed this transaction and payment is complete.
 * @param encodeURLParams.label - A label to be used by the wallet provider to identify this transaction; should be the merchant name
 * @param encodeURLParams.message - A message to be used by the wallet provider to identify this transaction; should describe the transaction to the user
 * @param encodeURLParams.memo - Creates an additional transaction for the [Memo Program](https://spl.solana.com/memo)
 */
export function encodeURL({ recipient, ...params }: EncodeURLComponents): string {
    let url = `solana:` + encodeURIComponent(recipient.toBase58());

    const encodedParams = encodeURLParams(params);
    if (encodedParams) {
        url += '?' + encodedParams;
    }

    return url;
}

/** @ignore */
export function encodeURLParams({ amount, token, reference, label, message, memo }: EncodeURLParams): string {
    const params: [string, string][] = [];

    if (amount) {
        params.push(['amount', String(amount)]);
    }

    if (token) {
        params.push(['spl-token', token.toBase58()]);
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

    return params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
}
