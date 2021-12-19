import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export interface ParsedURL {
    recipient: PublicKey;
    amount: BigNumber;
    token?: PublicKey;
    references?: PublicKey[];
    label?: string;
    message?: string;
    memo?: string;
}

export class ParseURLError extends Error {
    name = 'ParseURLError';
}

export function parseURL(url: string): ParsedURL {
    if (url.length > 2048) throw new ParseURLError('length invalid');

    const { protocol, pathname, searchParams } = new URL(url);
    if (protocol !== 'solana:') throw new ParseURLError('protocol invalid');

    let recipient: PublicKey;
    try {
        recipient = new PublicKey(pathname);
    } catch (error) {
        throw new ParseURLError('ParseURLError: recipient invalid');
    }

    const amountParam = searchParams.get('amount');
    if (!amountParam) throw new ParseURLError('amount missing');
    if (!/^\d+(\.\d+)?$/.test(amountParam)) throw new ParseURLError('amount invalid');

    const amount = new BigNumber(amountParam);
    if (amount.isNaN()) throw new ParseURLError('amount NaN');
    if (amount.isZero()) throw new ParseURLError('amount zero');

    const tokenParam = searchParams.get('spl-token');
    let token: PublicKey | undefined;
    if (tokenParam != null) {
        try {
            token = new PublicKey(tokenParam);
        } catch (error) {
            throw new ParseURLError('token invalid');
        }
    }

    const referenceParam = searchParams.getAll('reference');
    let references: PublicKey[] | undefined;
    if (referenceParam.length) {
        try {
            references = referenceParam.map((reference) => new PublicKey(reference));
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
        token,
        references,
        label,
        message,
        memo,
    };
}
