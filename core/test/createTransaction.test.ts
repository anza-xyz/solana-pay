import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { createTransaction, CreateTransactionError } from '../../src/wallet/createTransaction';

describe('createTransaction', () => {
    let connection: Connection;

    beforeEach(() => {
        const endpoint = clusterApiUrl('devnet');
        connection = new Connection(endpoint, 'confirmed');
    });

    describe('errors', () => {
        it('throws an error on invalid payer', async () => {
            expect.assertions(1);
            await expect(
                async () =>
                    await createTransaction(
                        connection,
                        new Keypair().publicKey,
                        new Keypair().publicKey,
                        new BigNumber(1),
                        {}
                    )
            ).rejects.toThrow('payer not found');
        });

        it('throws an error on invalid recipient', async () => {
            expect.assertions(1);
            await expect(
                async () =>
                    await createTransaction(
                        connection,
                        new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                        new Keypair().publicKey,
                        new BigNumber(1),
                        {}
                    )
            ).rejects.toThrow('recipient not found');
        });
    });
});
