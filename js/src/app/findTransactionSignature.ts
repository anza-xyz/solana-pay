import { ConfirmedSignatureInfo, Connection, Finality, PublicKey, SignaturesForAddressOptions } from '@solana/web3.js';

export enum FindError {
    NOT_FOUND = 'NOT_FOUND'
}

export async function findTransactionSignature(
    connection: Connection,
    reference: PublicKey,
    options?: SignaturesForAddressOptions,
    finality?: Finality,
): Promise<ConfirmedSignatureInfo> {
    const signatures = await connection.getSignaturesForAddress(reference, options, finality);

    const length = signatures.length;
    if (!length) throw new Error(FindError.NOT_FOUND);
    if (length < (options?.limit || 1000)) return signatures[length - 1];

    try {
        return await findTransactionSignature(connection, reference, options, finality);
    } catch (error: any) {
        if (error?.message === FindError.NOT_FOUND) return signatures[length - 1];
        throw error;
    }
}
