import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export interface ParsedURL {
    recipient: PublicKey;
    amount: BigNumber | undefined;
    token: PublicKey | undefined;
    reference: PublicKey[] | undefined;
    label: string | undefined;
    message: string | undefined;
    memo: string | undefined;
}

export class ParseURLError extends Error {
    name = 'ParseURLError';
}

export function parseURL(url: string): ParsedURL {
    if (url.length > 2048) throw new ParseURLError('length invalid');

    const { protocol, pathname, searchParams } = new URL(url);
    if (protocol !== 'solana:') throw new ParseURLError('protocol invalid');
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

    let token: PublicKey | undefined;
    const tokenParam = searchParams.get('spl-token');
    if (tokenParam != null) {
        try {
            token = new PublicKey(tokenParam);
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
        token,
        reference,
        label,
        message,
        memo,
    };
}
