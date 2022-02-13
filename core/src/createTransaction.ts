import { createTransferCheckedInstruction, getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { MEMO_PROGRAM_ID, SOL_DECIMALS, TEN } from './constants';
import { Amount, Memo, Recipient, References, SPLToken } from './types';

/**
 * Thrown when a transfer transaction can't be created from the inputs provided.
 */
export class CreateTransactionError extends Error {
    name = 'CreateTransactionError';
}

/**
 * Fields for creating a Solana Pay transfer transaction.
 */
export interface CreateTransactionFields {
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
 * Create a Solana Pay transfer transaction.
 *
 * @param fields - Fields from a transfer request URL.
 * @param sender - Account that send the transaction.
 * @param connection - A connection to the cluster.
 *
 * @throws {CreateTransactionError}
 */
export async function createTransaction(
    { recipient, amount, splToken, reference, memo }: CreateTransactionFields,
    sender: PublicKey,
    connection: Connection
): Promise<Transaction> {
    // Check that the sender and recipient accounts exist
    const senderInfo = await connection.getAccountInfo(sender);
    if (!senderInfo) throw new CreateTransactionError('sender not found');

    const recipientInfo = await connection.getAccountInfo(recipient);
    if (!recipientInfo) throw new CreateTransactionError('recipient not found');

    // A native SOL or SPL token transfer instruction
    const instruction = splToken
        ? await createSPLTokenInstruction(recipient, amount, splToken, sender, connection)
        : await createSystemInstruction(recipient, amount, sender, connection);

    // If reference accounts are provided, add them to the transfer instruction
    if (reference) {
        if (!Array.isArray(reference)) {
            reference = [reference];
        }

        for (const pubkey of reference) {
            instruction.keys.push({ pubkey, isWritable: false, isSigner: false });
        }
    }

    // Create the transaction
    const transaction = new Transaction();

    // If a memo is provided, add it to the transaction before adding the transfer instruction
    if (memo != null) {
        transaction.add(
            new TransactionInstruction({
                programId: MEMO_PROGRAM_ID,
                keys: [],
                data: Buffer.from(memo, 'utf8'),
            })
        );
    }

    // Add the transfer instruction to the transaction
    transaction.add(instruction);

    return transaction;
}

async function createSystemInstruction(
    recipient: PublicKey,
    amount: BigNumber,
    sender: PublicKey,
    connection: Connection
): Promise<TransactionInstruction> {
    // Check that the sender and recipient accounts exist
    const senderInfo = await connection.getAccountInfo(sender);
    if (!senderInfo) throw new CreateTransactionError('sender not found');

    const recipientInfo = await connection.getAccountInfo(recipient);
    if (!recipientInfo) throw new CreateTransactionError('recipient not found');

    // Check that the sender and recipient are valid native accounts
    if (!senderInfo.owner.equals(SystemProgram.programId)) throw new CreateTransactionError('sender owner invalid');
    if (senderInfo.executable) throw new CreateTransactionError('sender executable');
    if (!recipientInfo.owner.equals(SystemProgram.programId))
        throw new CreateTransactionError('recipient owner invalid');
    if (recipientInfo.executable) throw new CreateTransactionError('recipient executable');

    // Check that the amount provided doesn't have greater precision than SOL
    if (amount.decimalPlaces() > SOL_DECIMALS) throw new CreateTransactionError('amount decimals invalid');

    // Convert input decimal amount to integer lamports
    amount = amount.times(LAMPORTS_PER_SOL).integerValue(BigNumber.ROUND_FLOOR);

    // Check that the sender has enough lamports
    const lamports = amount.toNumber();
    if (lamports > senderInfo.lamports) throw new CreateTransactionError('insufficient funds');

    // Create an instruction to transfer native SOL
    return SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: recipient,
        lamports,
    });
}

async function createSPLTokenInstruction(
    recipient: PublicKey,
    amount: BigNumber,
    splToken: PublicKey,
    sender: PublicKey,
    connection: Connection
): Promise<TransactionInstruction> {
    // Check that the token provided is an initialized mint
    const mint = await getMint(connection, splToken);
    if (!mint.isInitialized) throw new CreateTransactionError('mint not initialized');

    // Check that the amount provided doesn't have greater precision than the mint
    if (amount.decimalPlaces() > mint.decimals) throw new CreateTransactionError('amount decimals invalid');

    // Convert input decimal amount to integer tokens according to the mint decimals
    amount = amount.times(TEN.pow(mint.decimals)).integerValue(BigNumber.ROUND_FLOOR);

    // Get the sender's ATA and check that the account exists and can send tokens
    const senderATA = await getAssociatedTokenAddress(splToken, sender);
    const senderAccount = await getAccount(connection, senderATA);
    if (!senderAccount.isInitialized) throw new CreateTransactionError('sender not initialized');
    if (senderAccount.isFrozen) throw new CreateTransactionError('sender frozen');

    // Get the recipient's ATA and check that the account exists and can receive tokens
    const recipientATA = await getAssociatedTokenAddress(splToken, recipient);
    const recipientAccount = await getAccount(connection, recipientATA);
    if (!recipientAccount.isInitialized) throw new CreateTransactionError('recipient not initialized');
    if (recipientAccount.isFrozen) throw new CreateTransactionError('recipient frozen');

    // Check that the sender has enough tokens
    const tokens = BigInt(String(amount));
    if (tokens > senderAccount.amount) throw new CreateTransactionError('insufficient funds');

    // Create an instruction to transfer SPL tokens, asserting the mint and decimals match
    return createTransferCheckedInstruction(senderATA, splToken, recipientATA, sender, tokens, mint.decimals);
}
