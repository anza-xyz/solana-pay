import { createQR, encodeURL } from '@solana/pay';
import React, { FC, useMemo } from 'react';
import { useConfig } from '../hooks/useConfig';
import { usePayment } from '../hooks/usePayment';

export const QRCode: FC = () => {
    const { account, token, label } = useConfig();
    const { amount, message, memo, reference } = usePayment();

    const content = useMemo(
        () =>
            amount &&
            encodeURL(account, amount, {
                token,
                references: reference && [reference],
                label,
                message,
                memo,
            }),
        [account, amount, token, reference, label, message, memo]
    );

    const src = useMemo(
        () =>
            content &&
            'data:image/svg+xml;utf8,' +
                encodeURIComponent(createQR({ content, width: 400, height: 400, join: true, xmlDeclaration: false })),
        [content]
    );

    return src ? <img width={400} height={400} src={src} alt="" /> : null;
};
