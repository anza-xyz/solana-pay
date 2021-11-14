import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export function encodeURL(
    recipient: PublicKey,
    amount: BigNumber,
    token?: PublicKey,
    references?: PublicKey[],
    label?: string,
    message?: string,
    memo?: string,
): string {
    let url = `solana:${String(recipient)}?amount=${String(amount)}`;

    if (token) {
        url += `&spl-token=${String(token)}`;
    }

    if (references?.length) {
        for (const reference of references) {
            url += `&reference=${String(reference)}`;
        }
    }

    if (label) {
        url += `&label=${String(label)}`;
    }

    if (message) {
        url += `&message=${String(message)}`;
    }

    if (memo) {
        url += `&memo=${String(memo)}`;
    }

    return url;
}
