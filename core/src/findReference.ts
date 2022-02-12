import { ConfirmedSignatureInfo, Connection, Finality, SignaturesForAddressOptions } from '@solana/web3.js';
import { Reference } from './types';

/**
 * Thrown when no transaction signature can be found referencing a given public key.
 */
export class FindReferenceError extends Error {
    name = 'FindReferenceError';
}

/**
 * Find the oldest transaction signature referencing a given public key.
 *
 * @param connection - A connection to the cluster.
 * @param reference - `reference` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#reference).
 * @param options - Options for `getSignaturesForAddress`.
 * @param finality - A subset of `Commitment` levels, which are at least optimistically confirmed.
 *
 * @throws {FindReferenceError}
 */
export async function findReference(
    connection: Connection,
    reference: Reference,
    options?: SignaturesForAddressOptions,
    finality?: Finality
): Promise<ConfirmedSignatureInfo> {
    const signatures = await connection.getSignaturesForAddress(reference, options, finality);

    const length = signatures.length;
    if (!length) throw new FindReferenceError('not found');

    // If multiple transaction signatures are found within the limit, return the oldest one.
    if (length < (options?.limit || 1000)) return signatures[length - 1];

    try {
        // In the unlikely event that more signatures than the limit are found, recursively find the oldest one.
        return await findReference(connection, reference, options, finality);
    } catch (error: any) {
        if (error instanceof FindReferenceError) return signatures[length - 1];
        throw error;
    }
}
