import { ConfirmedSignatureInfo, Connection, Finality, PublicKey, SignaturesForAddressOptions } from '@solana/web3.js';

export class FindTransactionSignatureError extends Error {
    name = 'FindTransactionSignatureError';
}

export async function findTransactionSignature(
    connection: Connection,
    reference: PublicKey,
    options?: SignaturesForAddressOptions,
    finality?: Finality,
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
