import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { findTransactionSignature } from '../src/findTransactionSignature';

// Test setup
const validReference = new Keypair().publicKey;
const signatureForAddress = {
    [validReference.toBase58()]: [
        {
            signature: 'signature',
        },
    ],
};

const connection = {
    getSignaturesForAddress: async (reference: PublicKey) => {
        return signatureForAddress[reference.toBase58()] || [];
    },
} as unknown as Connection;
// end: Test setup

describe('findTransactionSignature', () => {
    it('should return the last signature', async () => {
        const recieved = await findTransactionSignature(connection, validReference);
        const expected = {
            signature: 'signature',
        };

        expect(recieved).toEqual(expected);
    });

    describe('errors', () => {
        it('throws an error on signature not found', async () => {
            expect.assertions(1);

            const reference = new Keypair().publicKey;

            await expect(async () => await findTransactionSignature(connection, reference)).rejects.toThrow(
                'not found'
            );
        });
    });
});
