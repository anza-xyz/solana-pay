import { Keypair } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { encodeURL } from '../src/encodeURL';

describe('encodeURL', () => {
    it('encodes a URL', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(12345);
        const token = new Keypair().publicKey;
        const reference1 = new Keypair().publicKey;
        const reference2 = new Keypair().publicKey;

        const references = [reference1, reference2];
        const label = 'label';
        const message = 'message';
        const memo = 'memo';

        const url = encodeURL(recipient, {
            amount,
            token,
            references,
            label,
            message,
            memo,
        });

        expect(url).toBe(
            `solana:${recipient}?amount=${amount.toNumber()}&spl=${token}&reference=${reference1}&reference=${reference2}&label=${label}&message=${message}&memo=${memo}`
        );
    });

    it('encodes a url with recipient and amount', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(12345);

        const url = encodeURL(recipient, {
            amount,
        });

        expect(url).toBe(`solana:${recipient}?amount=${amount.toNumber()}`);
    });

    it('encodes a url with recipient, amount and token', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(12345);
        const token = new Keypair().publicKey;

        const url = encodeURL(recipient, {
            amount,
            token,
        });

        expect(url).toBe(`solana:${recipient}?amount=${amount.toNumber()}&spl=${token}`);
    });

    it('encodes a url with recipient, amount and references', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(12345);
        const reference1 = new Keypair().publicKey;
        const references = [reference1];

        const url = encodeURL(recipient, {
            amount,
            references,
        });

        expect(url).toBe(`solana:${recipient}?amount=${amount.toNumber()}&reference=${reference1}`);
    });

    it('encodes a url with recipient, amount and label', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(12345);
        const label = 'label';

        const url = encodeURL(recipient, {
            amount,
            label,
        });

        expect(url).toBe(`solana:${recipient}?amount=${amount.toNumber()}&label=${label}`);
    });

    it('encodes a url with recipient, amount and message', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(12345);
        const message = 'message';

        const url = encodeURL(recipient, {
            amount,
            message,
        });

        expect(url).toBe(`solana:${recipient}?amount=${amount.toNumber()}&message=${message}`);
    });

    it('encodes a url with recipient, amount and memo', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(12345);
        const memo = 'memo';

        const url = encodeURL(recipient, {
            amount,
            memo,
        });

        expect(url).toBe(`solana:${recipient}?amount=${amount.toNumber()}&memo=${memo}`);
    });
});
