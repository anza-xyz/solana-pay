import { createQR, encodeURL } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import React, { FC, useMemo } from 'react';
import { useConfig } from '../hooks/useConfig';
import { useInput } from '../hooks/useInput';

export interface QRCodeProps {
    references: PublicKey[];
}

export const QRCode: FC<QRCodeProps> = ({ references }) => {
    const { account, token, label } = useConfig();
    const { amount, message, memo } = useInput();

    const content = useMemo(
        () =>
            amount &&
            encodeURL(account, amount, {
                token,
                references,
                label,
                message,
                memo,
            }),
        [account, amount, token, references, label, message, memo]
    );

    const src = useMemo(
        () =>
            content &&
            'data:image/svg+xml;utf8,' +
                encodeURIComponent(createQR({ content, width: 512, height: 512, join: true, xmlDeclaration: false })),
        [content]
    );

    return src ? <img width={512} height={512} src={src} alt="" /> : null;
};
