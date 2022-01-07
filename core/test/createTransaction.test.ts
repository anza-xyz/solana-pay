import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { createTransaction } from '../../src/wallet/createTransaction';

describe('createTransaction', () => {
    let connection: Connection;

    beforeAll(() => {
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

    describe('transfer', () => {
        let wallet: Keypair;

        beforeAll(async () => {
            wallet = Keypair.generate();

            const airdropSignature = await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL / 1000);
            await connection.confirmTransaction(airdropSignature);
        });

        describe('when transferring native SOL', () => {
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
    });
});
