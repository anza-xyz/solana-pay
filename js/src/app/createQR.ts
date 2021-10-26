import QRCode from 'qrcode-svg';

export function createQR(content: string | QRCode.Options): string {
    if (typeof content === 'string') return new QRCode(content).svg();
    return new QRCode({ pretty: false, ...content}).svg();
}
