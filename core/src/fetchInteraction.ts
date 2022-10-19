import type { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { Transaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { toUint8Array } from 'js-base64';
import nacl from 'tweetnacl';

/**
 * Thrown when a transaction response can't be fetched.
 */
export class FetchInteractionError extends Error {
    name = 'FetchInteractionError';
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

export interface FetchInteractionErrorResponse {
    message?: string;
}

export type FetchInteractionResponse =
    | FetchTransactionResponse
    | FetchSignMessageResponse
    | FetchInteractionErrorResponse;

interface FetchInteractionServerResponse {
    transaction?: string;
    data?: string;
    state?: string;
    message?: string;
}

export const isTransactionResponse = (value: FetchInteractionResponse): value is FetchTransactionResponse => {
    return 'transaction' in value;
};

export const isSignMessageResponse = (value: FetchInteractionResponse): value is FetchSignMessageResponse => {
    return 'data' in value && `state` in value;
};

export const isErrorResponse = (value: FetchInteractionErrorResponse): value is FetchInteractionErrorResponse => {
    return !isSignMessageResponse(value) && !isTransactionResponse(value);
};

const isBase64 = (value: string): boolean => {
    return /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(value);
};

/**
 * Fetch a transaction from a Solana Pay transaction request link.
 *
 * @param connection - A connection to the cluster.
 * @param account - Account that may sign the transaction.
 * @param link - `link` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#link).
 * @param options - Options for `getLatestBlockhash`.
 *
 * @throws {FetchInteractionError}
 */
export async function fetchInteraction(
    connection: Connection,
    account: PublicKey,
    link: string | URL,
    { commitment }: { commitment?: Commitment } = {}
): Promise<FetchInteractionResponse> {
    const response = await fetch(String(link), {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account }),
    });

    const json: FetchInteractionServerResponse = await response.json();

    if (!json.transaction && !json.state && !json.data && !json.message) {
        throw new FetchInteractionError('invalid response');
    }

    /**
     * Transaction Request validation and parsing
     */

    if (json.transaction) {
        if (json.data || json.state) throw new FetchInteractionError('invalid transaction response');
        if (typeof json.transaction !== 'string') throw new FetchInteractionError('invalid transaction');
        const transaction = Transaction.from(toUint8Array(json.transaction));
        const { signatures, feePayer, recentBlockhash } = transaction;

        if (signatures.length) {
            if (!feePayer) throw new FetchInteractionError('missing fee payer');
            if (!feePayer.equals(signatures[0].publicKey)) throw new FetchInteractionError('invalid fee payer');
            if (!recentBlockhash) throw new FetchInteractionError('missing recent blockhash');

            // A valid signature for everything except `account` must be provided.
            const message = transaction.serializeMessage();
            for (const { signature, publicKey } of signatures) {
                if (signature) {
                    if (!nacl.sign.detached.verify(message, signature, publicKey.toBuffer()))
                        throw new FetchInteractionError('invalid signature');
                } else if (publicKey.equals(account)) {
                    // If the only signature expected is for `account`, ignore the recent blockhash in the transaction.
                    if (signatures.length === 1) {
                        transaction.recentBlockhash = (await connection.getLatestBlockhash(commitment)).blockhash;
                    }
                } else {
                    throw new FetchInteractionError('missing signature');
                }
            }
        } else {
            // Ignore the fee payer and recent blockhash in the transaction and initialize them.
            transaction.feePayer = account;
            transaction.recentBlockhash = (await connection.getLatestBlockhash(commitment)).blockhash;
        }

        return {
            transaction,
            message: json.message,
        };
    }

    /**
     * Sign Message Request validation and parsing
     */

    if (json.data) {
        if (typeof json.state !== 'string') throw new FetchInteractionError('invalid state field');
        if (!isBase64(json.data)) throw new FetchInteractionError('invalid data field');

        return {
            data: json.data,
            state: json.state,
            message: json.message,
        };
    }

    return {
        message: json.message,
    };
}
