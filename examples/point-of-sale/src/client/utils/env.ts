export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'SOL';
export const MAX_VALUE = Number(process.env.NEXT_PUBLIC_MAX_VALUE) || 99999.99;
export const IS_CUSTOMER_POS = process.env.NEXT_PUBLIC_IS_CUSTOMER_POS === 'true' || false;
export const SHOW_SYMBOL = process.env.NEXT_PUBLIC_SHOW_SYMBOL === 'true' || false;
export const SHOW_MERCHANT_LIST = process.env.NEXT_PUBLIC_SHOW_MERCHANT_LIST === 'true' || false;
export const IS_DEV = process.env.NEXT_PUBLIC_IS_DEV === 'true' || false;
export const USE_HTTP = process.env.NEXT_PUBLIC_USE_HTTP === 'true' || false;
export const USE_LINK = process.env.NEXT_PUBLIC_USE_LINK === 'true' || false;
export const USE_WEB_WALLET = process.env.NEXT_PUBLIC_USE_WEB_WALLET === 'true' || false;
export const AUTO_CONNECT = process.env.NEXT_PUBLIC_AUTO_CONNECT === 'true' || false;
export const DEFAULT_WALLET = process.env.NEXT_PUBLIC_DEFAULT_WALLET || 'Solflare';
export const APP_TITLE = process.env.NEXT_PUBLIC_APP_TITLE || 'Solana Pay';
export const DEFAULT_LANGUAGE = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';
export const MERCHANT_IMAGE_PATH = process.env.NEXT_PUBLIC_MERCHANT_IMAGE_PATH || '/Img/Merchant/';
export const FAUCET = (!IS_DEV ? process.env.NEXT_PUBLIC_FAUCET : null) || 'https://spl-token-faucet.com';
export const ABOUT = process.env.NEXT_PUBLIC_ABOUT || 'https://solanapay.com/';
export const GOOGLE_SPREADSHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID;
export const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
