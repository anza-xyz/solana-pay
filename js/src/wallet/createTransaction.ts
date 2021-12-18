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

// @TODO: replace with error classes
export enum CreateTransactionError {
    ACCOUNT_OWNER_INVALID = 'ACCOUNT_OWNER_INVALID',
    ACCOUNT_EXECUTABLE_INVALID = 'ACCOUNT_EXECUTABLE_INVALID',
    ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
    MINT_NOT_INITIALIZED = 'MINT_NOT_INITIALIZED',
    AMOUNT_INVALID_DECIMALS = 'AMOUNT_INVALID_DECIMALS',
    ACCOUNT_NOT_INITIALIZED = 'ACCOUNT_NOT_INITIALIZED',
    ACCOUNT_FROZEN = 'ACCOUNT_FROZEN',
    INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
}

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

const SOL_DECIMALS = 9;
const TEN = new BigNumber(10);

export async function createTransaction(
    connection: Connection,
    payer: PublicKey,
    recipient: PublicKey,
    amount: BigNumber,
    { token, references, memo }: {
        token?: PublicKey,
        references?: PublicKey[],
        memo?: string,
    },
): Promise<Transaction> {
    // Check that the payer and recipient accounts exist
    const payerInfo = await connection.getAccountInfo(payer);
    if (!payerInfo) throw new Error(CreateTransactionError.ACCOUNT_NOT_FOUND);

    const recipientInfo = await connection.getAccountInfo(recipient);
    if (!recipientInfo) throw new Error(CreateTransactionError.ACCOUNT_NOT_FOUND);

    // Either a native SOL or SPL token transfer instruction
    let instruction: TransactionInstruction;

    // If no SPL token mint is provided, transfer native SOL
    if (!token) {
        // Check that the payer and recipient are valid native accounts
        if (!payerInfo.owner.equals(SystemProgram.programId)) throw new Error(CreateTransactionError.ACCOUNT_OWNER_INVALID);
        if (payerInfo.executable) throw new Error(CreateTransactionError.ACCOUNT_EXECUTABLE_INVALID);
        if (!recipientInfo.owner.equals(SystemProgram.programId)) throw new Error(CreateTransactionError.ACCOUNT_OWNER_INVALID);
        if (recipientInfo.executable) throw new Error(CreateTransactionError.ACCOUNT_EXECUTABLE_INVALID);

        // Check that the amount provided doesn't have greater precision than SOL
        if (amount.decimalPlaces() > SOL_DECIMALS) throw new Error(CreateTransactionError.AMOUNT_INVALID_DECIMALS);

        // Convert input decimal amount to integer lamports
        amount = amount.times(LAMPORTS_PER_SOL).integerValue(BigNumber.ROUND_FLOOR);

        // Check that the payer has enough lamports
        const lamports = amount.toNumber();
        if (lamports > payerInfo.lamports) throw new Error(CreateTransactionError.INSUFFICIENT_FUNDS);

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
        const mint = await getMint(connection, token);
        if (!mint.isInitialized) throw new Error(CreateTransactionError.MINT_NOT_INITIALIZED);

        // Check that the amount provided doesn't have greater precision than the mint
        if (amount.decimalPlaces() > mint.decimals) throw new Error(CreateTransactionError.AMOUNT_INVALID_DECIMALS);

        // Convert input decimal amount to integer tokens according to the mint decimals
        amount = amount.times(TEN.pow(mint.decimals)).integerValue(BigNumber.ROUND_FLOOR);

        // Get the payer's ATA and check that the account exists and can send tokens
        const payerATA = await getAssociatedTokenAddress(token, payer);
        const payerAccount = await getAccount(connection, payerATA);
        if (!payerAccount.isInitialized) throw new Error(CreateTransactionError.ACCOUNT_NOT_INITIALIZED);
        if (payerAccount.isFrozen) throw new Error(CreateTransactionError.ACCOUNT_FROZEN);

        // Get the recipient's ATA and check that the account exists and can receive tokens
        const recipientATA = await getAssociatedTokenAddress(token, recipient);
        const recipientAccount = await getAccount(connection, recipientATA);
        if (!recipientAccount.isInitialized) throw new Error(CreateTransactionError.ACCOUNT_NOT_INITIALIZED);
        if (recipientAccount.isFrozen) throw new Error(CreateTransactionError.ACCOUNT_FROZEN);

        // Check that the payer has enough tokens
        const tokens = BigInt(String(amount));
        if (tokens > payerAccount.amount) throw new Error(CreateTransactionError.INSUFFICIENT_FUNDS);

        // Create an instruction to transfer SPL tokens, asserting the mint and decimals match
        instruction = createTransferCheckedInstruction(
            payerATA,
            token,
            recipientATA,
            payer,
            tokens,
            mint.decimals,
        );
    }

    // If reference accounts are provided, add them to the instruction
    if (references?.length) {
        instruction.keys.push(...references.map((pubkey) => ({ pubkey, isWritable: false, isSigner: false })));
    }

    // Create the transaction
    const transaction = new Transaction().add(instruction);

    // If a memo is provided, add it to the transaction
    if (memo != null) {
        transaction.add(
            new TransactionInstruction({
                programId: MEMO_PROGRAM_ID,
                keys: [],
                data: Buffer.from(memo, 'utf8'),
            }),
        );
    }

    return transaction;
}
