import { getAssociatedTokenAddress } from '@solana/spl-token';
import { Connection, Finality, PublicKey, TransactionResponse, TransactionSignature } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export class ValidateTransactionSignatureError extends Error {
    name = 'ValidateTransactionSignatureError';
}

export async function validateTransactionSignature(
    connection: Connection,
    signature: TransactionSignature,
    recipient: PublicKey,
    amount: BigNumber,
    splToken?: PublicKey,
    reference?: PublicKey | PublicKey[],
    finality?: Finality
): Promise<TransactionResponse> {
    const response = await connection.getTransaction(signature, { commitment: finality });
    if (!response) throw new ValidateTransactionSignatureError('not found');
    if (!response.meta) throw new ValidateTransactionSignatureError('missing meta');
    if (response.meta.err) throw response.meta.err;

    if (!splToken) {
        const index = response.transaction.message.accountKeys.findIndex((pubkey) => pubkey.equals(recipient));
        if (index === -1) throw new ValidateTransactionSignatureError('recipient not found');

        const preAmount = new BigNumber(response.meta.preBalances[index]);
        const postAmount = new BigNumber(response.meta.postBalances[index]);

        if (preAmount.plus(amount) < postAmount) throw new ValidateTransactionSignatureError('amount not transferred');
    } else {
        const recipientATA = await getAssociatedTokenAddress(splToken, recipient);
        const index = response.transaction.message.accountKeys.findIndex((pubkey) => pubkey.equals(recipientATA));
        if (index === -1) throw new ValidateTransactionSignatureError('recipient not found');

        const preBalance = response.meta.preTokenBalances?.find((x) => x.accountIndex === index);
        if (!preBalance?.uiTokenAmount.uiAmountString) throw new ValidateTransactionSignatureError('balance not found');

        const postBalance = response.meta.postTokenBalances?.find((x) => x.accountIndex === index);
        if (!postBalance?.uiTokenAmount.uiAmountString)
            throw new ValidateTransactionSignatureError('balance not found');

        const preAmount = new BigNumber(preBalance.uiTokenAmount.uiAmountString);
        const postAmount = new BigNumber(postBalance.uiTokenAmount.uiAmountString);
        if (preAmount.plus(amount).lt(postAmount))
            throw new ValidateTransactionSignatureError('amount not transferred');

        // TODO: what if a token was used to pay for gas?
    }

    if (reference) {
        if (!Array.isArray(reference)) {
            reference = [reference];
        }

        for (const pubkey of reference) {
            if (!response.transaction.message.accountKeys.some((accountKey) => accountKey.equals(pubkey)))
                throw new ValidateTransactionSignatureError('reference not found');
        }
    }

    return response;
}
