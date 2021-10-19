import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export interface ParsedURL {
    recipient: PublicKey;
    amount: BigNumber;
    memo: string;
    token?: PublicKey;
    label?: string;
    message?: string;
}

export interface URLParams {
    amount?: string;
    label?: string;
    message?: string;
    memo?: string;
    'spl-token'?: string;
}

export enum ParseError {
    INVALID_URL = 'INVALID_URL',
    INVALID_PROTOCOL = 'INVALID_PROTOCOL',
    INVALID_RECIPIENT = 'INVALID_RECIPIENT',
    MISSING_AMOUNT = 'MISSING_AMOUNT',
    INVALID_AMOUNT = 'INVALID_AMOUNT',
    ZERO_AMOUNT = 'ZERO_AMOUNT',
    MISSING_MEMO = 'MISSING_MEMO',
    INVALID_TOKEN = 'INVALID_TOKEN',
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

    const params: URLParams = Object.fromEntries(searchParams.entries());
    if (!params.amount) throw new Error(ParseError.MISSING_AMOUNT);
    if (!/^\d+(\.\d+)?$/.test(params.amount)) throw new Error(ParseError.INVALID_AMOUNT);

    const amount = new BigNumber(params.amount);
    if (amount.isNaN()) throw new Error(ParseError.INVALID_AMOUNT);
    if (amount.isZero()) throw new Error(ParseError.ZERO_AMOUNT);

    const { memo, label, message } = params;
    if (!memo) throw new Error(ParseError.MISSING_MEMO);

    let token: PublicKey | undefined;
    if (params['spl-token']) {
        try {
            token = new PublicKey(params['spl-token']);
        } catch (error) {
            throw new Error(ParseError.INVALID_TOKEN);
        }
    }

    return {
        recipient,
        amount,
        memo,
        token,
        label,
        message,
    };
}
