import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { findTransactionSignature } from '../src';

const reference = Keypair.generate().publicKey;
const signaturesForAddress = {
    [reference.toBase58()]: [{ signature: 'signature' }],
};

const connection = {
    async getSignaturesForAddress(reference: PublicKey) {
        return signaturesForAddress[reference.toBase58()] || [];
    },
} as Connection;

describe('findTransactionSignature', () => {
    it('should return the last signature', async () => {
        expect.assertions(1);

        const found = await findTransactionSignature(connection, reference);

        expect(found).toEqual({ signature: 'signature' });
    });

    it('throws an error on signature not found', async () => {
        expect.assertions(1);

        const reference = Keypair.generate().publicKey;

        await expect(async () => await findTransactionSignature(connection, reference)).rejects.toThrow('not found');
    });
});
