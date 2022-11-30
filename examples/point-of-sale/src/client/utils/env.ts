export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'SOL';
export const IS_MERCHANT_POS = JSON.parse(process.env.NEXT_PUBLIC_IS_MERCHANT_POS as string);
export const SHOW_SYMBOL = JSON.parse(process.env.NEXT_PUBLIC_SHOW_SYMBOL as string);
export const IS_DEV = JSON.parse(process.env.NEXT_PUBLIC_IS_DEV as string);
export const USE_SSL = JSON.parse(process.env.NEXT_PUBLIC_USE_SSL as string);
export const MERCHANT_IMAGE_PATH = process.env.NEXT_PUBLIC_MERCHANT_IMAGE_PATH || '../Img/Merchant/';
