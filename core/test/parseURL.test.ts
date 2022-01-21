import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { parseURL } from '../src/parseURL';

describe('parseURL', () => {
    describe('parsing', () => {
        describe('when given correct params', () => {
            it('should parse successfully', () => {
                const url =
                    'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&reference=82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678';

                const parsed = parseURL(url);

                expect(parsed.recipient).toEqual(new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'));
                expect(parsed.amount).toEqual(new BigNumber(0.01));
                expect(parsed.token).toBeUndefined();
                expect(parsed.reference).toEqual([new PublicKey('82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny')]);
                expect(parsed.label).toEqual('Michael');
                expect(parsed.message).toEqual('Thanks for all the fish');
                expect(parsed.memo).toEqual('OrderId5678');
            });

            it('should parse with spl-token', () => {
                const url =
                    'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&spl-token=82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678';

                const parsed = parseURL(url);

                expect(parsed.recipient).toEqual(new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'));
                expect(parsed.amount).toEqual(new BigNumber(0.01));
                expect(parsed.token).toEqual(new PublicKey('82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny'));
                expect(parsed.reference).toBeUndefined();
                expect(parsed.label).toEqual('Michael');
                expect(parsed.message).toEqual('Thanks for all the fish');
                expect(parsed.memo).toEqual('OrderId5678');
            });

            it('should parse without an amount', () => {
                const url =
                    'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?reference=82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678';

                const parsed = parseURL(url);

                expect(parsed.amount).toBeUndefined();
                expect(parsed.recipient).toEqual(new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'));
                expect(parsed.token).toBeUndefined();
                expect(parsed.reference).toEqual([new PublicKey('82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny')]);
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

        it.each([['1milliondollars'], [-0.1], [-100]])('throws an error on invalid amount: %p', (amount) => {
            const url = `solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=${amount}`;

            expect(() => parseURL(url)).toThrow('amount invalid');
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
