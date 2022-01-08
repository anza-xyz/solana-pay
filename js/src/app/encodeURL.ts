import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export function encodeURL(
    recipient: PublicKey,
    {
        amount,
        token,
        references,
        label,
        message,
        memo,
    }: {
        amount?: BigNumber;
        token?: PublicKey;
        references?: PublicKey | PublicKey[];
        label?: string;
        message?: string;
        memo?: string;
    }
): string {
    const params: [string, string][] = [];

    if (amount) {
        params.push(['amount', String(amount)]);
    }

    if (token) {
        params.push(['spl', token.toBase58()]);
    }

    if (references) {
        if (!Array.isArray(references)) {
            references = [references];
        }

        if (references?.length) {
            for (const reference of references) {
                params.push(['reference', reference.toBase58()]);
            }
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

    let url = `solana:${encodeURIComponent(recipient.toBase58())}`;
    if (params.length) {
        url += '?' + params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
    }
    return url;
}
