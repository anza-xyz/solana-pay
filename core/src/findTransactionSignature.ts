import { ConfirmedSignatureInfo, Connection, Finality, PublicKey, SignaturesForAddressOptions } from '@solana/web3.js';

/** @ignore */
export class FindTransactionSignatureError extends Error {
    name = 'FindTransactionSignatureError';
}

/**
 * Find a transaction signature
 *
 * @throws if signature can't be found
 *
 * @param connection - A connection to the cluster.
 * @param reference - A `PublicKey` that was included as a reference in the transaction.
 * @param {SignaturesForAddressOptions} options - Options for getSignaturesForAddress.
 * @param {Finality} finality - A subset of Commitment levels, which are at least optimistically confirmed
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
    if (length < (options?.limit || 1000)) return signatures[length - 1];

    try {
        return await findTransactionSignature(connection, reference, options, finality);
    } catch (error: any) {
        if (error instanceof FindTransactionSignatureError) return signatures[length - 1];
        throw error;
    }
}
