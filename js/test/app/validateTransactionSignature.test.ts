import { Connection, Finality, PublicKey, TransactionResponse, TransactionSignature } from '@solana/web3.js';

describe('validateTransactionSignature', () => {
    describe('validate native SOL transaction', () => {
        it.todo('returns transaction response');

        describe('errors', () => {
            it.todo('throws an error on missing recepient');
            it.todo('throws an error on amount not transferred');
        });
    });

    describe('validate SPL token transaction', () => {
        it.todo('returns transaction response');

        describe('errors', () => {
            it.todo('throws an error on missing recepient');
            it.todo('throws an error on pre balance not found');
            it.todo('throws an error on post balance not found');
            it.todo('throws an error on amount not transferred');
        });
    });

    describe('errors', () => {
        it.todo('throws an error on invalid  signature');
        it.todo('throws an error on missing meta');
    });
});
