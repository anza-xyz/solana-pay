import {
    decodeInstruction,
    getAssociatedTokenAddress,
    isTransferCheckedInstruction,
    isTransferInstruction,
} from '@solana/spl-token';
import {
    ConfirmedTransactionMeta,
    Connection,
    Finality,
    LAMPORTS_PER_SOL,
    Message,
    SystemInstruction,
    Transaction,
    TransactionResponse,
    TransactionSignature,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { MEMO_PROGRAM_ID } from './constants';
import { Amount, Memo, Recipient, Reference, References, SPLToken } from './types';

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

    if (reference && !Array.isArray(reference)) {
        reference = [reference];
    }

    const [preAmount, postAmount] = splToken
        ? await validateSPLTokenTransfer(message, meta, recipient, splToken, reference)
        : await validateSystemTransfer(message, meta, recipient, reference);
    if (postAmount.minus(preAmount).lt(amount)) throw new ValidateTransferError('amount not transferred');

    if (memo) {
        // Check that the second instruction is a memo instruction with the expected memo.
        const transaction = Transaction.populate(message);
        const instruction = transaction.instructions[1];
        if (!instruction) throw new ValidateTransferError('missing memo instruction');
        if (!instruction.programId.equals(MEMO_PROGRAM_ID)) throw new ValidateTransferError('invalid memo program');
        if (!instruction.data.equals(Buffer.from(memo, 'utf8'))) throw new ValidateTransferError('invalid memo');
    }

    return response;
}

async function validateSystemTransfer(
    message: Message,
    meta: ConfirmedTransactionMeta,
    recipient: Recipient,
    references?: Reference[]
): Promise<[BigNumber, BigNumber]> {
    if (references) {
        // Check that the first instruction is a system transfer instruction.
        const transaction = Transaction.populate(message);
        const instruction = transaction.instructions[0];
        SystemInstruction.decodeTransfer(instruction);

        // Check that the expected reference keys exactly match the extra keys provided to the instruction.
        const [_from, _to, ...extraKeys] = instruction.keys;
        const length = extraKeys.length;
        if (length !== references.length) throw new ValidateTransferError('invalid references');

        for (let i = 0; i < length; i++) {
            if (!extraKeys[i].pubkey.equals(references[i])) throw new ValidateTransferError(`invalid reference ${i}`);
        }
    }

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
    splToken: SPLToken,
    references?: Reference[]
): Promise<[BigNumber, BigNumber]> {
    if (references) {
        // Check that the first instruction is an SPL token transfer instruction.
        const transaction = Transaction.populate(message);
        const instruction = decodeInstruction(transaction.instructions[0]);
        if (!isTransferCheckedInstruction(instruction) && !isTransferInstruction(instruction))
            throw new ValidateTransferError('invalid transfer');

        // Check that the expected reference keys exactly match the extra keys provided to the instruction.
        const extraKeys = instruction.keys.multiSigners;
        const length = extraKeys.length;
        if (length !== references.length) throw new ValidateTransferError('invalid references');

        for (let i = 0; i < length; i++) {
            if (!extraKeys[i].pubkey.equals(references[i])) throw new ValidateTransferError(`invalid reference ${i}`);
        }
    }

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
