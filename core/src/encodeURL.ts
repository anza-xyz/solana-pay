import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { URL_PROTOCOL } from './constants';

/**
 * Optional query parameters to encode in a Solana Pay URL.
 */
export interface EncodeURLParams {
    /** The amount of SOL or SPL token that should be transferred. It  is always interpreted to be a decimal number of "user" units */
    amount?: BigNumber;
    /** The mint address of the SPL token */
    splToken?: PublicKey;
    /** An array of public keys used to identify the transaction */
    reference?: PublicKey | PublicKey[];
    /** A label to be used by the wallet provider to identify the transaction */
    label?: string;
    /** A message to be used by the wallet provider to identify the transaction */
    message?: string;
    /** Creates an additional instruction for the [Memo Program](https://spl.solana.com/memo) */
    memo?: string;
}

/**
 * Required and optional URL components to encode in a Solana Pay URL.
 */
export interface EncodeURLComponents extends EncodeURLParams {
    /** The address the payment should be made to. It **must** be a native SOL address. */
    recipient: PublicKey;
}

/**
 * Encode a Solana Pay URL from required and optional components.
 *
 * @param {EncodeURLComponents} components
 *
 * @param components.recipient - The address the payment should be made to. It **must** be a native SOL address.
 * @param components.amount - The amount of SOL or SPL token that should be transferred. It is always interpreted to be a decimal number of "user" units. If not provided, the user will be requested to enter an amount by the wallet provider.
 * @param components.splToken - The mint address of an SPL token. If not provided, the URL represents a native SOL transfer.
 * @param components.reference - A public key (or array of public keys) that must be referenced by the transaction. They are the **only** way you'll be able to ensure that the customer has completed this transaction and payment is complete.
 * @param components.label - A label to be used by the wallet provider to identify the transaction; should be the merchant name
 * @param components.message - A message to be used by the wallet provider to identify the transaction; should describe the transaction to the user
 * @param components.memo - Creates an additional instruction for the [Memo Program](https://spl.solana.com/memo)
 */
export function encodeURL({ recipient, ...params }: EncodeURLComponents): string {
    let url = URL_PROTOCOL + encodeURIComponent(recipient.toBase58());

    const encodedParams = encodeURLParams(params);
    if (encodedParams) {
        url += '?' + encodedParams;
    }

    return url;
}

function encodeURLParams({ amount, splToken, reference, label, message, memo }: EncodeURLParams): string {
    const params: [string, string][] = [];

    if (amount) {
        params.push(['amount', String(amount)]);
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

    return params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
}
