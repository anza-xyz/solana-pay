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
        references?: PublicKey[];
        label?: string;
        message?: string;
        memo?: string;
    }
): string {
    let url = `solana:${encodeURIComponent(recipient.toBase58())}`;

    if (amount) {
        url = `${url}&amount=${encodeURIComponent(String(amount))}`;
    }

    if (token) {
        url = `${url}&spl-token=${encodeURIComponent(token.toBase58())}`;
    }

    if (references?.length) {
        for (const reference of references) {
            url = `${url}&reference=${encodeURIComponent(reference.toBase58())}`;
        }
    }

    if (label) {
        url = `${url}&label=${encodeURIComponent(String(label))}`;
    }

    if (message) {
        url = `${url}&message=${encodeURIComponent(String(message))}`;
    }

    if (memo) {
        url = `${url}&memo=${encodeURIComponent(String(memo))}`;
    }

    return url;
}
