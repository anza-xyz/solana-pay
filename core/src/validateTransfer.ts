import { getAssociatedTokenAddress } from '@solana/spl-token';
import {
    ConfirmedTransactionMeta,
    Connection,
    Finality,
    LAMPORTS_PER_SOL,
    Message,
    TransactionResponse,
    TransactionSignature,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { Amount, Memo, Recipient, References, SPLToken } from './types';

/**
 * Thrown when a transaction doesn't contain a valid Solana Pay transfer.
 */
export class ValidateTransferError extends Error {
    name = 'ValidateTransferError';
}

/**
 * Fields of a Solana Pay transfer request to validate.
 */
export interface ValidateTransferFields {
    /** `recipient` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#recipient). */
    recipient: Recipient;
    /** `amount` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#amount). */
    amount: Amount;
    /** `spl-token` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#spl-token). */
    splToken?: SPLToken;
    /** `reference` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#reference). */
    reference?: References;
    /** `memo` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#memo). */
    memo?: Memo;
}

/**
 * Check that a given transaction contains a valid Solana Pay transfer.
 *
 * @param connection - A connection to the cluster.
 * @param signature - The signature of the transaction to validate.
 * @param fields - Fields of a Solana Pay transfer request to validate.
 * @param options - Options for `getTransaction`.
 *
 * @throws {ValidateTransferError}
 */
export async function validateTransfer(
    connection: Connection,
    signature: TransactionSignature,
    { recipient, amount, splToken, reference, memo }: ValidateTransferFields,
    options?: { commitment?: Finality }
): Promise<TransactionResponse> {
    const response = await connection.getTransaction(signature, options);
    if (!response) throw new ValidateTransferError('not found');

    const message = response.transaction.message;
    const meta = response.meta;
    if (!meta) throw new ValidateTransferError('missing meta');
    if (meta.err) throw meta.err;

    const [preAmount, postAmount] = splToken
        ? await validateSPLTokenTransfer(message, meta, recipient, splToken)
        : await validateSystemTransfer(message, meta, recipient);

    if (postAmount.minus(preAmount).lt(amount)) throw new ValidateTransferError('amount not transferred');

    if (reference) {
        if (!Array.isArray(reference)) {
            reference = [reference];
        }

        for (const pubkey of reference) {
            if (!message.accountKeys.some((accountKey) => accountKey.equals(pubkey)))
                throw new ValidateTransferError('reference not found');
        }
    }

    // FIXME: add memo check

    return response;
}

async function validateSystemTransfer(
    message: Message,
    meta: ConfirmedTransactionMeta,
    recipient: Recipient
): Promise<[BigNumber, BigNumber]> {
    const accountIndex = message.accountKeys.findIndex((pubkey) => pubkey.equals(recipient));
    if (accountIndex === -1) throw new ValidateTransferError('recipient not found');

    return [
        new BigNumber(meta.preBalances[accountIndex] || 0).div(LAMPORTS_PER_SOL),
        new BigNumber(meta.postBalances[accountIndex] || 0).div(LAMPORTS_PER_SOL),
    ];
}

async function validateSPLTokenTransfer(
    message: Message,
    meta: ConfirmedTransactionMeta,
    recipient: Recipient,
    splToken: SPLToken
): Promise<[BigNumber, BigNumber]> {
    const recipientATA = await getAssociatedTokenAddress(splToken, recipient);
    const accountIndex = message.accountKeys.findIndex((pubkey) => pubkey.equals(recipientATA));
    if (accountIndex === -1) throw new ValidateTransferError('recipient not found');

    const preBalance = meta.preTokenBalances?.find((x) => x.accountIndex === accountIndex);
    const postBalance = meta.postTokenBalances?.find((x) => x.accountIndex === accountIndex);

    return [
        new BigNumber(preBalance?.uiTokenAmount.uiAmountString || 0),
        new BigNumber(postBalance?.uiTokenAmount.uiAmountString || 0),
    ];
}
