import type { Commitment, Connection, PublicKey } from '@solana/web3.js';
import type { Transaction } from '@solana/web3.js';
import fetch from 'cross-fetch';

/**
 * Thrown when response is invalid
 */
export class SendSignedDataError extends Error {
    name = 'SendSignedDataError';
}

export interface FetchTransactionResponse {
    transaction: Transaction;
    message?: string;
}

export interface FetchSignMessageResponse {
    data: string;
    state: string;
    message?: string;
}

export interface SendSignedDataErrorResponse {
    message?: string;
}

export type SendSignedDataResponse = {
    success?: boolean;
};

/**
 * Fetch a transaction from a Solana Pay transaction request link.
 *
 * @param account - Account that signed the data
 * @param state - MAC value that was returned from the server during the the inital request.
 * @param signature - The signature from signing the data.
 * @param link - `link` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#link).
 *
 * @throws {SendSignedDataError}
 */
export async function fetchInteraction(
    account: PublicKey,
    state: string,
    signature: string,
    link: string | URL
): Promise<SendSignedDataResponse> {
    const response = await fetch(String(link), {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            account,
            state,
            signature,
        }),
    });

    const json: SendSignedDataResponse = await response.json();

    if (typeof json.success === 'undefined') {
        throw new SendSignedDataError('invalid response');
    }

    return json;
}
