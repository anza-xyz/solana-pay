import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { URLSearchParams } from 'url';
import { HTTPS_PROTOCOL, SOLANA_PROTOCOL } from './constants';

/**
 * Thrown when a URL can't be parsed as a Solana Pay URL.
 */
export class ParseURLError extends Error {
    name = 'ParseURLError';
}

/**
 * A Solana Pay transfer request URL.
 */
export interface TransferRequestURL {
    /** `recipient` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#recipient). */
    recipient: PublicKey;
    /** `amount` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#amount). */
    amount: BigNumber | undefined;
    /** `splToken` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#spl-token). */
    splToken: PublicKey | undefined;
    /** `reference` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#reference). */
    reference: PublicKey[] | undefined;
    /** `label` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#label). */
    label: string | undefined;
    /** `message` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#message). */
    message: string | undefined;
    /** `memo` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#memo). */
    memo: string | undefined;
}

/**
 * A Solana Pay transaction request URL.
 */
export interface TransactionRequestURL {
    /** `link` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#link). */
    link: URL;
    /** `label` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#label). */
    label: string | undefined;
    /** `message` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#message). */
    message: string | undefined;
}

/**
 * Parse a Solana Pay URL.
 *
 * @param url - URL to parse.
 *
 * @throws {ParseURLError}
 */
export function parseURL(url: string | URL): TransferRequestURL | TransactionRequestURL {
    if (typeof url === 'string') {
        if (url.length > 2048) throw new ParseURLError('length invalid');
        url = new URL(url);
    }

    const { protocol, pathname, searchParams } = url;
    if (protocol !== SOLANA_PROTOCOL) throw new ParseURLError('protocol invalid');
    if (!pathname) throw new ParseURLError('recipient missing');

    return /^[A-Za-z0-9]$/.test(pathname)
        ? parseTransferRequestURL(pathname, searchParams)
        : parseTransactionRequestURL(pathname, searchParams);
}

function parseTransferRequestURL(pathname: string, searchParams: URLSearchParams): TransferRequestURL {
    let recipient: PublicKey;
    try {
        recipient = new PublicKey(pathname);
    } catch (error: any) {
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

function parseTransactionRequestURL(pathname: string, searchParams: URLSearchParams): TransactionRequestURL {
    const link = new URL(decodeURIComponent(pathname));

    if (link.protocol !== HTTPS_PROTOCOL) throw new ParseURLError('protocol invalid');

    const label = searchParams.get('label') || undefined;
    const message = searchParams.get('message') || undefined;

    return {
        link,
        label,
        message,
    };
}
