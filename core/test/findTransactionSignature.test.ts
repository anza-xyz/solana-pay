import {
    Connection,
    PublicKey,
    Keypair,
    SignaturesForAddressOptions,
    Finality,
    ConfirmedSignatureInfo,
    clusterApiUrl,
} from '@solana/web3.js';
import { findReference } from '../src';

const reference = Keypair.generate().publicKey;
const signaturesForAddress = {
    [reference.toBase58()]: [
        { signature: 'signature1', blockTime: 0, slot: 0, memo: 'memo', err: null },
        { signature: 'signature2', blockTime: 0, slot: 0, memo: 'memo', err: null },
    ],
};

jest.spyOn(Connection.prototype, 'getSignaturesForAddress').mockImplementation(
    async (
        address: PublicKey,
        _options?: SignaturesForAddressOptions,
        _commitment?: Finality
    ): Promise<ConfirmedSignatureInfo[]> => {
        return signaturesForAddress[address.toBase58()] || [];
    }
);

describe('findTransactionSignature', () => {
    it('should return the last signature', async () => {
        expect.assertions(1);

        const endpoint = clusterApiUrl('devnet');
        const connection = new Connection(endpoint);

        const found = await findReference(connection, reference );

        expect(found).toEqual({ signature: 'signature2', blockTime: 0, slot: 0, memo: 'memo', err: null });
    });

    it('throws an error on signature not found', async () => {
        expect.assertions(1);

        const endpoint = clusterApiUrl('devnet');
        const connection = new Connection(endpoint);

        const reference = Keypair.generate().publicKey;

        await expect(async () => await findReference(connection, reference)).rejects.toThrow('not found');
    });
});
