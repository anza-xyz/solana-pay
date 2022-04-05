import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

/** @internal */
export const DEFAULT_URL_PROTOCOL = 'solana:';

/** @internal */
export const ACCEPTED_URL_PROTOCOLS = [DEFAULT_URL_PROTOCOL, 'https:', 'http:'];

/** @internal */
export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

/** @internal */
export const SOL_DECIMALS = 9;

/** @internal */
export const TEN = new BigNumber(10);
