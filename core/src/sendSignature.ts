import type { PublicKey } from '@solana/web3.js';
import fetch from 'cross-fetch';

/**
 * Thrown when response is invalid
 */
export class SendSignatureError extends Error {
    name = 'SendSignatureError';
}

export type SendSignatureResponse = {
    success?: boolean;
};

/**
 * Send the results of a Solana Pay sign-message request to the server.
 *
 * @param account - Account that signed the data
 * @param signature - The signature from signing the data.
 * @param state - MAC value that was sent by the server during the POST request.
 * @param link - `link` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#link).
 *
 * @throws {SendSignatureError}
 */
export async function sendSignature(
    account: PublicKey,
    state: string,
    signature: string,
    link: string | URL
): Promise<boolean> {
    const response = await fetch(String(link), {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            account,
            signature,
            state,
        }),
    });

    const json: SendSignatureResponse = await response.json();

    if (typeof json.success !== 'boolean') {
        throw new SendSignatureError('invalid response');
    }

    return json.success;
}
