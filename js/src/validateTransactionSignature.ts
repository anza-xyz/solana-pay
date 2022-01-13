import { getAssociatedTokenAddress } from '@solana/spl-token';
import { Connection, Finality, PublicKey, TransactionResponse, TransactionSignature } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { TEN } from './constants';

export class ValidateTransactionSignatureError extends Error {
    name = 'ValidateTransactionSignatureError';
}

export async function validateTransactionSignature(
    connection: Connection,
    signature: TransactionSignature,
    recipient: PublicKey,
    amount: BigNumber,
    token?: PublicKey,
    references?: PublicKey | PublicKey[],
    finality?: Finality
): Promise<TransactionResponse> {
    const response = await connection.getTransaction(signature, { commitment: finality });
    if (!response) throw new ValidateTransactionSignatureError('not found');
    if (!response.meta) throw new ValidateTransactionSignatureError('missing meta');
    if (response.meta.err) throw response.meta.err;

    if (!token) {
        const index = response.transaction.message.accountKeys.findIndex((pubkey) => pubkey.equals(recipient));
        if (index === -1) throw new ValidateTransactionSignatureError('recipient not found');

        const preAmount = new BigNumber(response.meta.preBalances[index]);
        const postAmount = new BigNumber(response.meta.postBalances[index]);

        if (preAmount.plus(amount) < postAmount) throw new ValidateTransactionSignatureError('amount not transferred');
    } else {
        const recipientATA = await getAssociatedTokenAddress(token, recipient);
        const index = response.transaction.message.accountKeys.findIndex((pubkey) => pubkey.equals(recipientATA));
        if (index === -1) throw new ValidateTransactionSignatureError('recipient not found');

        const mint = token.toBase58();

        const preBalance = response.meta.preTokenBalances?.find((x) => x.mint === mint && x.accountIndex === index);
        if (!preBalance) throw new ValidateTransactionSignatureError('balance not found');

        const postBalance = response.meta.postTokenBalances?.find((x) => x.mint === mint && x.accountIndex === index);
        if (!postBalance) throw new ValidateTransactionSignatureError('balance not found');

        const preAmount = new BigNumber(preBalance.uiTokenAmount.amount).div(
            TEN.pow(preBalance.uiTokenAmount.decimals)
        );
        const postAmount = new BigNumber(postBalance.uiTokenAmount.amount).div(
            TEN.pow(postBalance.uiTokenAmount.decimals)
        );

        if (preAmount.plus(amount) < postAmount) throw new ValidateTransactionSignatureError('amount not transferred');

        // TODO: what if a token was used to pay for gas?
    }

    if (references) {
        if (!Array.isArray(references)) {
            references = [references];
        }

        for (const reference of references) {
            if (!response.transaction.message.accountKeys.some((pubkey) => pubkey.equals(reference)))
                throw new ValidateTransactionSignatureError('reference not found');
        }
    }

    return response;
}
