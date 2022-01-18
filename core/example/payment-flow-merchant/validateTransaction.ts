import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { validateTransactionSignature } from '../../src/validateTransactionSignature';

export async function validateTransaction(
    connection: Connection,
    signature: string,
    recipient: PublicKey,
    amount: BigNumber,
    reference: PublicKey | PublicKey[]
) {
    const amountInLamports = convertToLamports(amount);

    return await validateTransactionSignature(connection, signature, recipient, amountInLamports, undefined, reference);
}

function convertToLamports(amount: BigNumber) {
    return amount.times(LAMPORTS_PER_SOL).integerValue(BigNumber.ROUND_FLOOR);
}
