import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export interface EncodeURLParams {
    amount?: BigNumber;
    token?: PublicKey;
    references?: PublicKey | PublicKey[];
    label?: string;
    message?: string;
    memo?: string;
    request?: string;
}

export interface EncodeURLComponents extends EncodeURLParams {
    recipient?: PublicKey;
}

export function encodeURL({ recipient, ...params }: EncodeURLComponents): string {
    let url = `solana:`;

    if (recipient) {
        url += encodeURIComponent(recipient.toBase58());
    }

    const encodedParams = encodeURLParams(params);
    if (encodedParams) {
        url += '?' + encodedParams;
    }

    return url;
}

export function encodeURLParams({ amount, token, references, label, message, memo, request }: EncodeURLParams): string {
    const params: [string, string][] = [];

    if (amount) {
        params.push(['amount', String(amount)]);
    }

    if (token) {
        params.push(['spl-token', token.toBase58()]);
    }

    if (references) {
        if (!Array.isArray(references)) {
            references = [references];
        }

        for (const reference of references) {
            params.push(['reference', reference.toBase58()]);
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

    if (request) {
        params.push(['request', request]);
    }

    return params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
}
