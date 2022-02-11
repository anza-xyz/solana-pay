import { ConfirmedSignatureInfo, Connection, Finality, PublicKey, SignaturesForAddressOptions } from '@solana/web3.js';

/**
 * Thrown when no transaction signature can be found referencing a given public key.
 */
export class FindTransactionSignatureError extends Error {
    name = 'FindTransactionSignatureError';
}

/**
 * Find the oldest transaction signature referencing a given public key.
 *
 * @throws if signature can't be found
 *
 * @param connection - A connection to the cluster.
 * @param reference - `reference` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#reference)
 * @param {SignaturesForAddressOptions} options - Options for `getSignaturesForAddress`.
 * @param {Finality} finality - A subset of Commitment levels, which are at least optimistically confirmed.
 */
export async function findTransactionSignature(
    connection: Connection,
    reference: PublicKey,
    options?: SignaturesForAddressOptions,
    finality?: Finality
): Promise<ConfirmedSignatureInfo> {
    const signatures = await connection.getSignaturesForAddress(reference, options, finality);

    const length = signatures.length;
    if (!length) throw new FindTransactionSignatureError('not found');

    // If multiple transaction signatures are found within the limit, return the oldest one.
    if (length < (options?.limit || 1000)) return signatures[length - 1];

    try {
        // In the unlikely event that more signatures than the limit are found, recursively find the oldest one.
        return await findTransactionSignature(connection, reference, options, finality);
    } catch (error: any) {
        if (error instanceof FindTransactionSignatureError) return signatures[length - 1];
        throw error;
    }
}
