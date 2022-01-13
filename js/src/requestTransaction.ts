import { PublicKey, Transaction } from '@solana/web3.js';
import base58 from 'bs58';
import { EncodeURLParams, encodeURLParams } from './encodeURL';

export class RequestTransactionError extends Error {
    name = 'RequestTransactionError';
}

export async function requestTransaction(
    request: string,
    from: PublicKey,
    params: Omit<EncodeURLParams, 'request'> = {}
): Promise<Transaction> {
    request += request.includes('?') ? '&' : '?';
    request += 'from=' + encodeURIComponent(from.toBase58());

    const encodedParams = encodeURLParams(params);
    if (encodedParams) {
        request += '&' + encodedParams;
    }

    if (request.length > 2048) throw new RequestTransactionError('length invalid');

    const response = await fetch(request);
    const json = await response.json();

    if (!json) throw new RequestTransactionError('invalid json');
    if (!('transaction' in json)) throw new RequestTransactionError('missing transaction');
    if (typeof json.transaction !== 'string') throw new RequestTransactionError('invalid transaction');

    return Transaction.from(base58.decode(json.transaction));
}
