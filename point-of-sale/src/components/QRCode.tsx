import { createQR } from '@solana/pay';
import React, { FC, useMemo } from 'react';
import { usePayment } from '../hooks/usePayment';

export const QRCode: FC = () => {
    const { url } = usePayment();

    const src = useMemo(
        () =>
            url &&
            'data:image/svg+xml;utf8,' +
                encodeURIComponent(
                    createQR({ content: url, width: 400, height: 400, join: true, xmlDeclaration: false })
                ),
        [url]
    );

    return src ? <img width={400} height={400} src={src} alt="" /> : null;
};
