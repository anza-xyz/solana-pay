import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { DEFAULT_URL_PROTOCOL, ACCEPTED_URL_PROTOCOLS } from './constants';

/**
 * Thrown when a URL can't be parsed as a Solana Pay URL.
 */
export class ParseURLError extends Error {
    name = 'ParseURLError';
}

/**
 * Parsed components of a Solana Pay URL.
 */
export interface ParsedURL {
    /** `recipient` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#recipient) */
    recipient: PublicKey;
    /** `amount` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#amount) */
    amount: BigNumber | undefined;
    /** `splToken` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#spl-token) */
    splToken: PublicKey | undefined;
    /** `reference` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#reference) */
    reference: PublicKey[] | undefined;
    /** `label` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#label) */
    label: string | undefined;
    /** `message` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#message) */
    message: string | undefined;
    /** `memo` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#memo) */
    memo: string | undefined;
    /** `request` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#request) */
    request: string | undefined;
}

/**
 * Parse the components of a Solana Pay URL.
 *
 * **Reference** implementation for wallet providers.
 *
 * @param url - A Solana Pay URL
 */
export function parseURL(url: string): ParsedURL {
    if (url.length > 2048) throw new ParseURLError('length invalid');

    const { protocol, pathname, searchParams } = new URL(url);
    if (!ACCEPTED_URL_PROTOCOLS.includes(protocol)) throw new ParseURLError('protocol invalid');

    const encodedRecipient = protocol === DEFAULT_URL_PROTOCOL ? pathname : searchParams.get('recipient');
    if (!encodedRecipient) throw new ParseURLError('recipient missing');

    let recipient: PublicKey;
    try {
        recipient = new PublicKey(encodedRecipient);
    } catch (error) {
        throw new ParseURLError('recipient invalid');
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

    const request = searchParams.get('request') || undefined;
    if (request != null) {
        try {
            new URL(request);
        } catch (error) {
            throw new ParseURLError('request invalid');
        }
    }

    return {
        recipient,
        amount,
        splToken,
        reference,
        label,
        message,
        memo,
        request,
    };
}
