import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js';
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
    const recipientPublicKey = new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN');
    const accountOwnedByWallet = Keypair.generate();
    const programAccount = Keypair.generate();

    beforeAll(async () => {
        wallet = Keypair.generate();

        connection = {
            getAccountInfo: (publicKey: PublicKey) => {
                const accounts = {
                    [wallet.publicKey.toBase58()]: {
                        executable: false,
                        owner: SystemProgram.programId,
                        lamports: LAMPORTS_PER_SOL / 100,
                    },
                    [recipientPublicKey.toBase58()]: {
                        executable: false,
                        owner: SystemProgram.programId,
                        lamports: LAMPORTS_PER_SOL / 100,
                    },
                    [SystemProgram.programId.toBase58()]: {
                        executable: true,
                        owner: SystemProgram.programId,
                        lamports: LAMPORTS_PER_SOL / 100,
                    },
                    [accountOwnedByWallet.publicKey.toBase58()]: {
                        executable: false,
                        owner: wallet.publicKey,
                        lamports: LAMPORTS_PER_SOL / 100,
                    },
                    [programAccount.publicKey.toBase58()]: {
                        executable: true,
                        owner: SystemProgram.programId,
                        lamports: LAMPORTS_PER_SOL / 100,
                    },
                };

                return accounts[publicKey.toBase58()] || null;
            },
        } as unknown as Connection;
    });

    describe('transaction', () => {
        it('creates a transaction without memo', async () => {
            expect.assertions(1);

            const transaction = await createTransaction(
                connection,
                wallet.publicKey,
                recipientPublicKey,
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
                recipientPublicKey,
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
                    await createTransaction(connection, wallet.publicKey, new Keypair().publicKey, new BigNumber(1), {})
            ).rejects.toThrow('recipient not found');
        });
    });

    describe('when transferring native SOL', () => {
        describe('errors', () => {
            it('throws an error on invalid payer owner', async () => {
                expect.assertions(1);

                await expect(async () => {
                    return await createTransaction(
                        connection,
                        accountOwnedByWallet.publicKey,
                        recipientPublicKey,
                        new BigNumber(1),
                        {}
                    );
                }).rejects.toThrow('payer owner invalid');
            });

            it('throws an error on executable payer', async () => {
                expect.assertions(1);

                await expect(async () => {
                    return await createTransaction(
                        connection,
                        programAccount.publicKey,
                        recipientPublicKey,
                        new BigNumber(1),
                        {}
                    );
                }).rejects.toThrow('payer executable');
            });

            it('throws an error on invalid recipient owner', async () => {
                expect.assertions(1);

                await expect(async () => {
                    return await createTransaction(
                        connection,
                        wallet.publicKey,
                        accountOwnedByWallet.publicKey,
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
                        recipientPublicKey,
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
                        recipientPublicKey,
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
                    return await createTransaction(connection, wallet.publicKey, recipientPublicKey, new BigNumber(1), {
                        token: new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                    });
                }).rejects.toThrow('mint not initialized');
            });

            it('throws an error on invalid decimal amount', async () => {
                expect.assertions(1);

                await expect(async () => {
                    return await createTransaction(
                        connection,
                        wallet.publicKey,
                        recipientPublicKey,
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
                        recipientPublicKey,
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
                        recipientPublicKey,
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
                        recipientPublicKey,
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
                        recipientPublicKey,
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
                    return await createTransaction(connection, wallet.publicKey, recipientPublicKey, new BigNumber(1), {
                        token: new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'),
                    });
                }).rejects.toThrow('insufficient funds');
            });
        });
    });
});
