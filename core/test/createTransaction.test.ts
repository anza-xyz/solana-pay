import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { createTransaction } from '../../src/wallet/createTransaction';
import { getMint, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

jest.mock('@solana/spl-token', () => ({
    getMint: jest.fn(),
    getAccount: jest.fn(),
    getAssociatedTokenAddress: jest.fn(),
}));

const mockGetMint = getMint as jest.Mock;
const mockGetAccount = getAccount as jest.Mock;
const mockGetAssociatedTokenAddress = getAssociatedTokenAddress as jest.Mock;

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
            let payerATA: PublicKey;
            let recipientATA: PublicKey;

            beforeEach(() => {
                mockGetMint.mockClear();
                mockGetAccount.mockClear();
                mockGetAssociatedTokenAddress.mockClear();
            });

            beforeEach(() => {
                mockGetMint.mockReturnValue({
                    isInitialized: true,
                    decimals: 9,
                });

                mockGetAccount.mockReturnValue({ isInitialized: true, amount: 0.5 });

                payerATA = new Keypair().publicKey;
                recipientATA = new Keypair().publicKey;

                mockGetAssociatedTokenAddress.mockImplementation((_, pubKey) => {
                    switch (pubKey.toString()) {
                        case wallet.publicKey.toString():
                            return payerATA;

                        default:
                            return recipientATA;
                    }
                });
            });

            it('throws an error on uninitialized mint', async () => {
                expect.assertions(1);

                mockGetMint.mockReturnValue({ isInitialized: false });

                await expect(async () => {
                    return await createTransaction(
                        connection,
                        wallet.publicKey,
                        new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                        new BigNumber(1),
                        {
                            token: new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                        }
                    );
                }).rejects.toThrow('mint not initialized');
            });

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

            it('throws an error on unintialized payer', async () => {
                expect.assertions(1);

                mockGetAccount.mockReturnValue({ isInitialized: false });

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

            it('throws an error on frozen payer', async () => {
                expect.assertions(1);

                mockGetAccount.mockReturnValue({ isInitialized: true, isFrozen: true });

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
                }).rejects.toThrow('payer frozen');
            });

            it('throws an error on unitialized recipient', async () => {
                expect.assertions(1);

                mockGetAccount.mockImplementation((_, ATA) => {
                    switch (ATA.toString()) {
                        case payerATA.toString():
                            return { isInitialized: true, isFrozen: false };

                        default:
                            return { isInitialized: false, isFrozen: false };
                    }
                });

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
                }).rejects.toThrow('recipient not initialized');
            });

            it('throws an error on frozen recipient', async () => {
                expect.assertions(1);

                mockGetAccount.mockImplementation((_, ATA) => {
                    switch (ATA.toString()) {
                        case payerATA.toString():
                            return { isInitialized: true, isFrozen: false };

                        default:
                            return { isInitialized: true, isFrozen: true };
                    }
                });

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
                }).rejects.toThrow('recipient frozen');
            });

            it('throws an error on insufficient funds', async () => {
                expect.assertions(1);

                await expect(async () => {
                    return await createTransaction(
                        connection,
                        wallet.publicKey,
                        new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                        new BigNumber(1),
                        {
                            token: new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                        }
                    );
                }).rejects.toThrow('insufficient funds');
            });
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
