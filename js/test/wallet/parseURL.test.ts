import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { parseURL } from '../../src/wallet/parseURL';

describe('parseURL', () => {
    describe('parsing', () => {
        describe('when given correct params', () => {
            it('should parse successfully', () => {
                const recipientPublicKey = 'mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN';
                const referencePublicKey = '82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny';
                const url = `solana:${recipientPublicKey}?amount=0.01&reference=${referencePublicKey}&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678`;

                const parsed = parseURL(url);

                expect(new PublicKey(recipientPublicKey).equals(parsed.recipient)).toBe(true);
                expect(parsed.amount).toEqual(new BigNumber(0.01));
                expect(parsed.token).toBeUndefined();
                expect((parsed.references as PublicKey[]).length).toBe(1);
                expect(new PublicKey(referencePublicKey).equals((parsed.references as PublicKey[])[0])).toBe(true);
                expect(parsed.label).toEqual('Michael');
                expect(parsed.message).toEqual('Thanks for all the fish');
                expect(parsed.memo).toEqual('OrderId5678');
            });

            it('should parse with spl-token', () => {
                const recipientPublicKey = 'mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN';
                const tokenMint = '82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny';
                const url = `solana:${recipientPublicKey}?amount=0.01&spl-token=${tokenMint}&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678`;

                const parsed = parseURL(url);

                expect(new PublicKey(recipientPublicKey).equals(parsed.recipient)).toBe(true);
                expect(new PublicKey(tokenMint).equals(parsed.token as PublicKey)).toBe(true);
                expect(parsed.amount).toEqual(new BigNumber(0.01));
                expect(parsed.references).toBeUndefined();
                expect(parsed.label).toEqual('Michael');
                expect(parsed.message).toEqual('Thanks for all the fish');
                expect(parsed.memo).toEqual('OrderId5678');
            });
        });
    });

    describe('errors', () => {
        it('throws an error on invalid length', () => {
            const url = 'X'.repeat(2059);
            expect(() => parseURL(url)).toThrow('length invalid');
        });

        it('throws an error on invalid protocol', () => {
            const url = 'eth:0xffff';
            expect(() => parseURL(url)).toThrow('protocol invalid');
        });

        it('throws an error on invalid recepient', () => {
            const url = 'solana:0xffff';
            expect(() => parseURL(url)).toThrow('recipient invalid');
        });

        it('throws an error on missing amount', () => {
            const url = 'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN';

            expect(() => parseURL(url)).toThrow('amount missing');
        });

        it.each([['1milliondollars'], [-0.1], [-100]])('throws an error on invalid amount: %p', (amount) => {
            const url = `solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=${amount}`;

            expect(() => parseURL(url)).toThrow('amount invalid');
        });

        it.skip('throws an error on NaN amount', () => {
            const url = 'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.0000.000000000000001';

            expect(() => parseURL(url)).toThrow('amount NaN');
        });

        it('throws an error on zero amount', () => {
            const url = 'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0';

            expect(() => parseURL(url)).toThrow('amount zero');
        });

        it('throws an error on invalid token', () => {
            const url = 'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=1&spl-token=0xffff';

            expect(() => parseURL(url)).toThrow('token invalid');
        });

        it('throws an error on invalid reference', () => {
            const url = 'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=1&reference=0xffff';

            expect(() => parseURL(url)).toThrow('reference invalid');
        });
    });
});
