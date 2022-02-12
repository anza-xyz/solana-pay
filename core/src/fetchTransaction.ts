import { Commitment, Connection, PublicKey, Transaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { toUint8Array } from 'js-base64';
import nacl from 'tweetnacl';

/**
 * Thrown when a transaction response can't be fetched.
 */
export class FetchTransactionError extends Error {
    name = 'FetchTransactionError';
}

/**
 * Fetch a transaction from a Solana Pay transaction request link.
 *
 * @param link - `link` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#link).
 * @param account - Public key of a signer account.
 * @param connection - A connection to the cluster.
 * @param commitment - `Commitment` level for the recent blockhash.
 *
 * @throws {FetchTransactionError}
 */
export async function fetchTransaction(
    link: string | URL,
    account: PublicKey,
    connection: Connection,
    commitment?: Commitment
): Promise<Transaction> {
    const response = await fetch(String(link), {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account: account.toBase58() }),
    });

    const json = await response.json();
    if (!json?.transaction) throw new FetchTransactionError('missing transaction');
    if (typeof json.transaction !== 'string') throw new FetchTransactionError('invalid transaction');

    const transaction = Transaction.from(toUint8Array(json.transaction));
    const signatures = transaction.signatures;

    if (signatures.length) {
        if (!transaction.feePayer) throw new FetchTransactionError('missing fee payer');
        if (!transaction.recentBlockhash) throw new FetchTransactionError('missing recent blockhash');

        const signature = signatures[0];
        if (!transaction.feePayer.equals(signature.publicKey)) throw new FetchTransactionError('invalid fee payer');

        // Message to verify the signatures against
        const message = transaction.serializeMessage();

        // Check all the signatures for duplicate, invalid, and missing values
        const publicKeys: Record<string, true> = {};
        for (const { signature, publicKey } of signatures) {
            const base58 = publicKey.toBase58();
            if (publicKeys[base58]) throw new FetchTransactionError('duplicate signature');
            publicKeys[base58] = true;

            if (publicKey.equals(account)) {
                // A signature for `account` must not be provided
                if (signature) throw new FetchTransactionError('invalid signature');
            } else {
                // A valid signature for everything except `account` must be provided
                if (!signature) throw new FetchTransactionError('missing signature');
                if (!nacl.sign.detached.verify(message, signature, publicKey.toBuffer()))
                    throw new FetchTransactionError('invalid signature');
            }
        }
    } else {
        // Ignore the fee payer and recent blockhash in the transaction and initialize them
        transaction.feePayer = account;
        transaction.recentBlockhash = (await connection.getLatestBlockhash(commitment)).blockhash;
    }

    return transaction;
}
