import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { createTransaction } from '../../src/wallet/createTransaction';

describe('createTransaction', () => {
    let connection: Connection;
    let wallet: Keypair;

    beforeAll(async () => {
        const endpoint = clusterApiUrl('devnet');
        connection = new Connection(endpoint, 'confirmed');

        wallet = Keypair.generate();

        const airdropSignature = await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL / 100);
        await connection.confirmTransaction(airdropSignature);
    });

    describe('when transferring native SOL', () => {
        describe('transaction', () => {
            it('creates a transaction without memo', async () => {
                expect.assertions(1);

                const transaction = await createTransaction(
                    connection,
                    wallet.publicKey,
                    new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                    new BigNumber(0.01),
                    {}
                );

                expect(transaction.instructions).toHaveLength(1);
                // FIXME: Best way to validate?
            });

            it('creates a transaction with memo', async () => {
                expect.assertions(1);

                const transaction = await createTransaction(
                    connection,
                    wallet.publicKey,
                    new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                    new BigNumber(0.01),
                    {
                        memo: 'Thanks for all the fish',
                    }
                );

                expect(transaction.instructions).toHaveLength(2);
                // FIXME: Best way to validate?
            });
        });

        describe('errors', () => {
            it('throws an error on invalid payer owner', async () => {
                expect.assertions(1);

                await expect(async () => {
                    return await createTransaction(
                        connection,
                        new PublicKey(SystemProgram.programId),
                        new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                        new BigNumber(1),
                        {}
                    );
                }).rejects.toThrow('payer owner invalid');
            });

            it.todo('throws an error on executable payer');

            it('throws an error on invalid recipient owner', async () => {
                expect.assertions(1);

                await expect(async () => {
                    return await createTransaction(
                        connection,
                        new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                        new PublicKey(SystemProgram.programId),
                        new BigNumber(1),
                        {}
                    );
                }).rejects.toThrow('recipient owner invalid');
            });

            it.todo('throws an error on executable recipient');

            it('throws an error on invalid decimal amount', async () => {
                expect.assertions(1);

                await expect(async () => {
                    return await createTransaction(
                        connection,
                        wallet.publicKey,
                        new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                        new BigNumber(1.0000000000001),
                        {}
                    );
                }).rejects.toThrow('amount decimals invalid');
            });

            it('throws an error on insufficient funds', async () => {
                expect.assertions(1);

                await expect(async () => {
                    return await createTransaction(
                        connection,
                        wallet.publicKey,
                        new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                        new BigNumber(100),
                        {}
                    );
                }).rejects.toThrow('insufficient funds');
            });
        });
    });

    describe('when transferring SPL token', () => {
        describe('errors', () => {
            it.todo('throws an error on invalid mint');

            it('throws an error on invalid decimal amount', async () => {
                expect.assertions(1);

                await expect(async () => {
                    return await createTransaction(
                        connection,
                        wallet.publicKey,
                        new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                        new BigNumber(1.0000000001),
                        {
                            token: new PublicKey('8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN'),
                        }
                    );
                }).rejects.toThrow('amount decimals invalid');
            });

            // FIXME: can't get past this error
            // Fails at getting associated token account
            it.skip('throws an error on unintialized payer', async () => {
                expect.assertions(1);

                await expect(async () => {
                    return await createTransaction(
                        connection,
                        wallet.publicKey,
                        new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                        new BigNumber(100),
                        {
                            token: new PublicKey('8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN'),
                        }
                    );
                }).rejects.toThrow('payer not initialized');
            });

            it.todo('throws an error on frozen payer');

            it.todo('throws an error on unitialized recipient');

            it.todo('throws an error on frozen recipient');

            it.todo('throws an error on insufficient funds');
        });
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
