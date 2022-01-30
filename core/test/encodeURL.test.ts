import { Keypair } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { encodeURL } from '../src/encodeURL';

describe('encodeURL', () => {
    it('encodes a URL', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(1.99);
        const splToken = new Keypair().publicKey;
        const reference1 = new Keypair().publicKey;
        const reference2 = new Keypair().publicKey;

        const reference = [reference1, reference2];
        const label = 'label';
        const message = 'message';
        const memo = 'memo';

        const url = encodeURL({ recipient, amount, splToken, reference, label, message, memo });

        expect(url).toBe(
            `solana:${recipient}?amount=${amount}&spl-token=${splToken}&reference=${reference1}&reference=${reference2}&label=${label}&message=${message}&memo=${memo}`
        );
    });

    it('encodes a url with recipient', () => {
        const recipient = new Keypair().publicKey;

        const url = encodeURL({ recipient });

        expect(url).toBe(`solana:${recipient}`);
    });

    it('encodes a url with recipient and amount', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(1);

        const url = encodeURL({ recipient, amount });

        expect(url).toBe(`solana:${recipient}?amount=${amount}`);
    });

    it('encodes a url with recipient, amount and token', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(100);
        const splToken = new Keypair().publicKey;

        const url = encodeURL({ recipient, amount, splToken });

        expect(url).toBe(`solana:${recipient}?amount=${amount}&spl-token=${splToken}`);
    });

    it('encodes a url with recipient, amount and references', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(100000.123456);
        const reference1 = new Keypair().publicKey;
        const reference = [reference1];

        const url = encodeURL({ recipient, amount, reference });

        expect(url).toBe(`solana:${recipient}?amount=${amount}&reference=${reference1}`);
    });

    it('encodes a url with recipient, amount and label', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(1.99);
        const label = 'label';

        const url = encodeURL({ recipient, amount, label });

        expect(url).toBe(`solana:${recipient}?amount=${amount}&label=${label}`);
    });

    it('encodes a url with recipient, amount and message', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(1);
        const message = 'message';

        const url = encodeURL({ recipient, amount, message });

        expect(url).toBe(`solana:${recipient}?amount=${amount}&message=${message}`);
    });

    it('encodes a url with recipient, amount and memo', () => {
        const recipient = new Keypair().publicKey;
        const amount = new BigNumber(100);
        const memo = 'memo';

        const url = encodeURL({ recipient, amount, memo });

        expect(url).toBe(`solana:${recipient}?amount=${amount}&memo=${memo}`);
    });
});
