import { PublicKey, Transaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { toUint8Array } from 'js-base64';

/**
 * Thrown when a transaction response can't be fetched.
 */
export class FetchTransactionError extends Error {
    name = 'FetchTransactionError';
}

/**
 * Fetch a Solana Pay transaction from a transaction request link.
 *
 * @param link - `link` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#link).
 * @param account - Signer account within a wallet.
 *
 * @throws {FetchTransactionError}
 */
export async function fetchTransaction(link: string | URL, account: PublicKey): Promise<Transaction> {
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

    return Transaction.from(toUint8Array(json.transaction));
}
