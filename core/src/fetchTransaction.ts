import type { Commitment, Connection, PublicKey } from '@solana/web3.js';
import type { Transaction } from '@solana/web3.js';
import { fetchInteraction, isTransactionResponse } from './fetchInteraction.js';

/**
 * Thrown when a transaction response can't be fetched.
 */
export class FetchTransactionError extends Error {
    name = 'FetchTransactionError';
}

/**
 * Fetch a transaction from a Solana Pay transaction request link.
 *
 * @param connection - A connection to the cluster.
 * @param account - Account that may sign the transaction.
 * @param link - `link` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#link).
 * @param options - Options for `getRecentBlockhash`.
 *
 * @throws {FetchTransactionError}
 */
export async function fetchTransaction(
    connection: Connection,
    account: PublicKey,
    link: string | URL,
    { commitment }: { commitment?: Commitment } = {}
): Promise<Transaction> {
    const response = await fetchInteraction(connection, account, link, { commitment });

    if (!isTransactionResponse(response)) {
        throw new FetchTransactionError('invalid response');
    }

    return response.transaction;
}
