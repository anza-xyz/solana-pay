import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export function encodeURL(
    recipient: PublicKey,
    amount: BigNumber,
    { token, references, label, message, memo }: {
        token?: PublicKey,
        references?: PublicKey[],
        label?: string,
        message?: string,
        memo?: string,
    },
): string {
    let url = `solana:${encodeURIComponent(String(recipient))}?amount=${encodeURIComponent(String(amount))}`;

    if (token) {
        url += `&spl-token=${encodeURIComponent(String(token))}`;
    }

    if (references?.length) {
        for (const reference of references) {
            url += `&reference=${encodeURIComponent(String(reference))}`;
        }
    }

    if (label) {
        url += `&label=${encodeURIComponent(String(label))}`;
    }

    if (message) {
        url += `&message=${encodeURIComponent(String(message))}`;
    }

    if (memo) {
        url += `&memo=${encodeURIComponent(String(memo))}`;
    }

    return url;
}
