import { ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export enum CreateTransactionError {
    PAYER_NOT_FOUND = 'PAYER_NOT_FOUND',
    RECIPIENT_NOT_FOUND = 'RECIPIENT_NOT_FOUND',
    TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
    TOKEN_INVALID_PROGRAM = 'TOKEN_INVALID_PROGRAM',
    TOKEN_INVALID_LENGTH = 'TOKEN_INVALID_LENGTH',
    TOKEN_MINT_NOT_INITIALIZED = 'TOKEN_MINT_NOT_INITIALIZED',
    AMOUNT_INVALID_DECIMALS = 'AMOUNT_INVALID_DECIMALS',
    PAYER_ATA_NOT_FOUND = 'PAYER_ATA_NOT_FOUND',
    RECIPIENT_ATA_NOT_FOUND = 'RECIPIENT_ATA_NOT_FOUND',
    PAYER_INSUFFICIENT_FUNDS = 'PAYER_INSUFFICIENT_FUNDS',
}

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

const SOL_DECIMALS = 9;
const TEN = new BigNumber(10);

export async function createTransaction(
    connection: Connection,
    payer: PublicKey,
    recipient: PublicKey,
    amount: BigNumber,
    memo: string,
    token?: PublicKey,
): Promise<Transaction> {
    const payerInfo = await connection.getAccountInfo(payer);
    if (!payerInfo) throw new Error(CreateTransactionError.PAYER_NOT_FOUND);

    const recipientInfo = await connection.getAccountInfo(recipient);
    if (!recipientInfo) throw new Error(CreateTransactionError.RECIPIENT_NOT_FOUND);

    const transaction = new Transaction();

    // If no SPL token mint is provided, transfer lamports
    if (!token) {
        // Check that the amount provided doesn't have greater precision than SOL
        if (amount.decimalPlaces() > SOL_DECIMALS) throw new Error(CreateTransactionError.AMOUNT_INVALID_DECIMALS);

        // @TODO: convert to u64 instead of JS number
        // Convert input decimal amount to lamports
        const lamports = amount.times(LAMPORTS_PER_SOL).integerValue(BigNumber.ROUND_FLOOR).toNumber();

        // Check that the payer has enough lamports
        if (lamports > payerInfo.lamports) throw new Error(CreateTransactionError.PAYER_INSUFFICIENT_FUNDS);

        transaction.add(
            SystemProgram.transfer({
                fromPubkey: payer,
                toPubkey: recipient,
                lamports,
            }),
        );
    }
    // Otherwise, transfer SPL tokens from payer's ATA to recipient's ATA
    else {
        // Check that the token provided is an initialized mint owned by the token program
        const tokenInfo = await connection.getAccountInfo(token);
        if (!tokenInfo) throw new Error(CreateTransactionError.TOKEN_NOT_FOUND);
        if (!tokenInfo.owner.equals(TOKEN_PROGRAM_ID)) throw new Error(CreateTransactionError.TOKEN_INVALID_PROGRAM);
        if (tokenInfo.data.length !== MintLayout.span) throw new Error(CreateTransactionError.TOKEN_INVALID_LENGTH);

        const mint = MintLayout.decode(tokenInfo.data);
        if (!mint.isInitialized) throw new Error(CreateTransactionError.TOKEN_MINT_NOT_INITIALIZED);

        // Check that the amount provided doesn't have greater precision than the mint
        const decimals: number = mint.decimals;
        if (amount.decimalPlaces() > decimals) throw new Error(CreateTransactionError.AMOUNT_INVALID_DECIMALS);

        // Get the payer's ATA and check that it exists
        const payerATA = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            token,
            payer,
        );
        const payerATAInfo = await connection.getAccountInfo(payerATA);
        if (!payerATAInfo) throw new Error(CreateTransactionError.PAYER_ATA_NOT_FOUND);

        // Get the recipient's ATA and check that it exists
        const recipientATA = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            token,
            recipient,
        );
        const recipientATAInfo = await connection.getAccountInfo(recipientATA);
        if (!recipientATAInfo) throw new Error(CreateTransactionError.RECIPIENT_ATA_NOT_FOUND);

        // @TODO: convert to u64 instead of JS number
        // Convert input decimal amount to tokens according to the mint decimals
        const tokens = amount.times(TEN.pow(decimals)).integerValue(BigNumber.ROUND_FLOOR).toNumber();

        transaction.add(
            Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                payerATA,
                recipientATA,
                payer,
                [],
                tokens,
            ),
        );
    }

    // Add the memo to the transaction
    transaction.add(
        new TransactionInstruction({
            programId: MEMO_PROGRAM_ID,
            keys: [],
            data: Buffer.from(memo, 'utf8'),
        }),
    );

    return transaction;
}

export {};
