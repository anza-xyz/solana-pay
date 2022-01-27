import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { URL_PROTOCOL } from './constants';

export interface ParsedURL {
    /** The address the payment should be made to. It **must** be a native SOL address. */
    recipient: PublicKey;
    /** The amount of SOL or SPL token that should be transferred. It  is always interpreted to be a decimal number of "user" units */
    amount: BigNumber | undefined;
    /** The mint address of the SPL token */
    splToken: PublicKey | undefined;
    /** An array of public keys used to identify the transaction */
    reference: PublicKey[] | undefined;
    /** A label to be used by the wallet provider to identify the transaction */
    label: string | undefined;
    /** A message to be used by the wallet provider to identify the transaction */
    message: string | undefined;
    /** Creates an additional instruction for the [Memo Program](https://spl.solana.com/memo) */
    memo: string | undefined;
}

/** @internal */
export class ParseURLError extends Error {
    name = 'ParseURLError';
}

/**
 * Parse the URL based off the Solana Pay URI scheme
 *
 * **Reference** implementation for wallet providers.
 *
 * @param url - The payment request url
 */
export function parseURL(url: string): ParsedURL {
    if (url.length > 2048) throw new ParseURLError('length invalid');

    const { protocol, pathname, searchParams } = new URL(url);
    if (protocol !== URL_PROTOCOL) throw new ParseURLError('protocol invalid');
    if (!pathname) throw new ParseURLError('recipient missing');

    let recipient: PublicKey;
    try {
        recipient = new PublicKey(pathname);
    } catch (error) {
        throw new ParseURLError('ParseURLError: recipient invalid');
    }

    let amount: BigNumber | undefined;
    const amountParam = searchParams.get('amount');
    if (amountParam != null) {
        if (!/^\d+(\.\d+)?$/.test(amountParam)) throw new ParseURLError('amount invalid');

        amount = new BigNumber(amountParam);
        if (amount.isNaN()) throw new ParseURLError('amount NaN');
        if (amount.isNegative()) throw new ParseURLError('amount negative');
    }

    let splToken: PublicKey | undefined;
    const splTokenParam = searchParams.get('spl-token');
    if (splTokenParam != null) {
        try {
            splToken = new PublicKey(splTokenParam);
        } catch (error) {
            throw new ParseURLError('token invalid');
        }
    }

    let reference: PublicKey[] | undefined;
    const referenceParam = searchParams.getAll('reference');
    if (referenceParam.length) {
        try {
            reference = referenceParam.map((reference) => new PublicKey(reference));
        } catch (error) {
            throw new ParseURLError('reference invalid');
        }
    }

    const label = searchParams.get('label') || undefined;
    const message = searchParams.get('message') || undefined;
    const memo = searchParams.get('memo') || undefined;

    return {
        recipient,
        amount,
        splToken,
        reference,
        label,
        message,
        memo,
    };
}
