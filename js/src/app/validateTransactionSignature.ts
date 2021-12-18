import { getAssociatedTokenAddress } from '@solana/spl-token';
import {
    ConfirmedSignatureInfo,
    Connection,
    Finality,
    PublicKey,
    TransactionResponse,
    TransactionSignature,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export enum ValidateError {
    NOT_FOUND = 'NOT_FOUND',
    MISSING_META = 'MISSING_META',
    INVALID_RECIPIENT = 'INVALID_RECIPIENT',
    INVALID_BALANCE = 'INVALID_BALANCE',
}

const TEN = new BigNumber(10);

export async function validateTransactionSignature(
    connection: Connection,
    signature: TransactionSignature,
    recipient: PublicKey,
    amount: BigNumber,
    token?: PublicKey,
    finality?: Finality
): Promise<TransactionResponse> {
    const response = await connection.getTransaction(signature, { commitment: finality });
    if (!response) throw new Error(ValidateError.NOT_FOUND);
    if (!response.meta) throw new Error(ValidateError.MISSING_META);

    if (!token) {
        const index = response.transaction.message.accountKeys.indexOf(recipient);
        if (index === -1) throw new Error(ValidateError.INVALID_RECIPIENT);

        const preBalance = new BigNumber(response.meta.preBalances[index]);
        const postBalance = new BigNumber(response.meta.postBalances[index]);

        // TODO: validate balance change with amount
    }
    else {
        const recipientATA = await getAssociatedTokenAddress(token, recipient);
        const index = response.transaction.message.accountKeys.indexOf(recipientATA);
        if (index === -1) throw new Error(ValidateError.INVALID_RECIPIENT);

        const mint = token.toBase58();

        const preBalance = response.meta.preTokenBalances?.find((x) => x.mint === mint && x.accountIndex === index);
        if (!preBalance) throw new Error(ValidateError.INVALID_BALANCE);

        const postBalance = response.meta.postTokenBalances?.find((x) => x.mint === mint && x.accountIndex === index);
        if (!postBalance) throw new Error(ValidateError.INVALID_BALANCE);

        const preAmount = new BigNumber(preBalance.uiTokenAmount.amount).div(TEN.pow(preBalance.uiTokenAmount.decimals));
        const postAmount = new BigNumber(postBalance.uiTokenAmount.amount).div(TEN.pow(postBalance.uiTokenAmount.decimals));

        // TODO: validate balance change with amount -- but what if a token was used to pay for gas?
    }

    return response;
}
