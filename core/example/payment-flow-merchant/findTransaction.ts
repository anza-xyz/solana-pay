import { ConfirmedSignatureInfo, Connection, PublicKey } from '@solana/web3.js';
import { findTransactionSignature, FindTransactionSignatureError } from '../../src/findTransactionSignature';

export async function findTransaction(connection: Connection, reference: PublicKey): Promise<ConfirmedSignatureInfo> {
    let signatureInfo: ConfirmedSignatureInfo;
    let count = 1;

    return new Promise((resolve, reject) => {
        /**
         * Retry until we find the transaction
         *
         * If a transaction with the given reference can't be found, the `findTransactionSignature`
         * function will throw an error. There are a few reasons why this could be a false negative:
         *
         * - Transaction is not yet confirmed
         * - Customer is yet to approve/complete the transaction
         *
         * You can implement a polling strategy to query for the transaction periodically.
         */
        const interval = setInterval(async () => {
            console.log('Checking for transaction...', count);
            try {
                signatureInfo = await findTransactionSignature(connection, reference, undefined, 'confirmed');
                console.log('\n 🖌  Signature found: ', signatureInfo.signature);
                clearInterval(interval);
                resolve(signatureInfo);
            } catch (error: any) {
                if (!(error instanceof FindTransactionSignatureError)) {
                    console.error(error);
                    clearInterval(interval);
                    reject(error);
                }
            }

            count++;
        }, 250);
    });
}
