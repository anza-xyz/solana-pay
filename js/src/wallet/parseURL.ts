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

// @TODO: replace with error classes
export enum ParseError {
    INVALID_URL = 'INVALID_URL',
    INVALID_PROTOCOL = 'INVALID_PROTOCOL',
    INVALID_RECIPIENT = 'INVALID_RECIPIENT',
    MISSING_AMOUNT = 'MISSING_AMOUNT',
    INVALID_AMOUNT = 'INVALID_AMOUNT',
    ZERO_AMOUNT = 'ZERO_AMOUNT',
    INVALID_TOKEN = 'INVALID_TOKEN',
    INVALID_REFERENCE = 'INVALID_REFERENCE',
}

export function parseURL(url: string): ParsedURL {
    if (url.length > 2048) throw new Error(ParseError.INVALID_URL);

    const { protocol, pathname, searchParams } = new URL(url);
    if (protocol !== 'solana:') throw new Error(ParseError.INVALID_PROTOCOL);

    let recipient: PublicKey;
    try {
        recipient = new PublicKey(pathname);
    } catch (error) {
        throw new Error(ParseError.INVALID_RECIPIENT);
    }

    const amountParam = searchParams.get('amount');
    if (!amountParam) throw new Error(ParseError.MISSING_AMOUNT);
    if (!/^\d+(\.\d+)?$/.test(amountParam)) throw new Error(ParseError.INVALID_AMOUNT);

    const amount = new BigNumber(amountParam);
    if (amount.isNaN()) throw new Error(ParseError.INVALID_AMOUNT);
    if (amount.isZero()) throw new Error(ParseError.ZERO_AMOUNT);

    const tokenParam = searchParams.get('spl-token');
    let token: PublicKey | undefined;
    if (tokenParam != null) {
        try {
            token = new PublicKey(tokenParam);
        } catch (error) {
            throw new Error(ParseError.INVALID_TOKEN);
        }
    }

    const referenceParam = searchParams.getAll('reference');
    let references: PublicKey[] | undefined;
    if (referenceParam.length) {
        try {
            references = referenceParam.map((reference) => new PublicKey(reference));
        } catch (error) {
            throw new Error(ParseError.INVALID_REFERENCE);
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
