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

export class CreateTransactionError extends Error {
    name = 'CreateTransactionError';
}

export interface CreateTransactionParams {
    /** The mint address of the SPL token */
    splToken?: PublicKey;
    /** An array of public keys used to identify this transaction */
    reference?: PublicKey | PublicKey[];
    /** Creates an additional transaction for the [Memo Program](https://spl.solana.com/memo) */
    memo?: string;
}

/**
 * Create a transaction
 *
 * **Reference** implementation for wallet providers.
 *
 * @param connection - A connection to the cluster.
 * @param payer - `PublicKey` of the payer.
 * @param recipient - The **native SOL** address the payment should be made to.
 * @param amount - The amount of SOL or SPL token that should be transferred.
 * @param {CreateTransactionParams} createTransactionParams - Additional parameters
 * @param createTransactionParams.splToken - The mint address of the SPL token.
 * @param createTransactionParams.reference - An array of public keys used to identify this transaction.
 * @param createTransactionParams.memo - Creates an additional instruction for the [Memo Program](https://spl.solana.com/memo)
 */
export async function createTransaction(
    connection: Connection,
    payer: PublicKey,
    recipient: PublicKey,
    amount: BigNumber,
    { splToken, reference, memo }: CreateTransactionParams = {}
): Promise<Transaction> {
    // Check that the payer and recipient accounts exist
    const payerInfo = await connection.getAccountInfo(payer);
    if (!payerInfo) throw new CreateTransactionError('payer not found');

    const recipientInfo = await connection.getAccountInfo(recipient);
    if (!recipientInfo) throw new CreateTransactionError('recipient not found');

    // A native SOL or SPL token transfer instruction
    let instruction: TransactionInstruction;

    // If no SPL token mint is provided, transfer native SOL
    if (!splToken) {
        // Check that the payer and recipient are valid native accounts
        if (!payerInfo.owner.equals(SystemProgram.programId)) throw new CreateTransactionError('payer owner invalid');
        if (payerInfo.executable) throw new CreateTransactionError('payer executable');
        if (!recipientInfo.owner.equals(SystemProgram.programId))
            throw new CreateTransactionError('recipient owner invalid');
        if (recipientInfo.executable) throw new CreateTransactionError('recipient executable');

        // Check that the amount provided doesn't have greater precision than SOL
        if (amount.decimalPlaces() > SOL_DECIMALS) throw new CreateTransactionError('amount decimals invalid');

        // Convert input decimal amount to integer lamports
        amount = amount.times(LAMPORTS_PER_SOL).integerValue(BigNumber.ROUND_FLOOR);

        // Check that the payer has enough lamports
        const lamports = amount.toNumber();
        if (lamports > payerInfo.lamports) throw new CreateTransactionError('insufficient funds');

        // Create an instruction to transfer native SOL
        instruction = SystemProgram.transfer({
            fromPubkey: payer,
            toPubkey: recipient,
            lamports,
        });
    }
    // Otherwise, transfer SPL tokens from payer's ATA to recipient's ATA
    else {
        // Check that the token provided is an initialized mint
        const mint = await getMint(connection, splToken);
        if (!mint.isInitialized) throw new CreateTransactionError('mint not initialized');

        // Check that the amount provided doesn't have greater precision than the mint
        if (amount.decimalPlaces() > mint.decimals) throw new CreateTransactionError('amount decimals invalid');

        // Convert input decimal amount to integer tokens according to the mint decimals
        amount = amount.times(TEN.pow(mint.decimals)).integerValue(BigNumber.ROUND_FLOOR);

        // Get the payer's ATA and check that the account exists and can send tokens
        const payerATA = await getAssociatedTokenAddress(splToken, payer);
        const payerAccount = await getAccount(connection, payerATA);
        if (!payerAccount.isInitialized) throw new CreateTransactionError('payer not initialized');
        if (payerAccount.isFrozen) throw new CreateTransactionError('payer frozen');

        // Get the recipient's ATA and check that the account exists and can receive tokens
        const recipientATA = await getAssociatedTokenAddress(splToken, recipient);
        const recipientAccount = await getAccount(connection, recipientATA);
        if (!recipientAccount.isInitialized) throw new CreateTransactionError('recipient not initialized');
        if (recipientAccount.isFrozen) throw new CreateTransactionError('recipient frozen');

        // Check that the payer has enough tokens
        const tokens = BigInt(String(amount));
        if (tokens > payerAccount.amount) throw new CreateTransactionError('insufficient funds');

        // Create an instruction to transfer SPL tokens, asserting the mint and decimals match
        instruction = createTransferCheckedInstruction(payerATA, splToken, recipientATA, payer, tokens, mint.decimals);
    }

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
