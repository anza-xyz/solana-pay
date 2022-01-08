import { createQROptions } from '@solana/pay';
import QRCodeStyling from 'qr-code-styling';
import React, { FC, useLayoutEffect, useMemo, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import { usePayment } from '../hooks/usePayment';
import { useTheme } from '../hooks/useTheme';

export const QRCode: FC = () => {
    const phone = useMediaQuery({ query: '(max-width: 767px)' });
    const size = useMemo(() => (phone && typeof window !== 'undefined' ? window.screen.availWidth - 48 : 400), [phone]);
    const { theme } = useTheme();
    const [background, color] = useMemo(
        () => (theme === 'light' ? ['#EFF2F3', '#2A2A2A'] : ['#2A2A2A', '#EEF5F6']),
        [theme]
    );
    const { url } = usePayment();
    const options = useMemo(() => createQROptions(url, size, background, color), [url, size, background, color]);

    const qr = useMemo(() => new QRCodeStyling(), []);
    useLayoutEffect(() => qr.update(options), [qr, options]);

    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (ref.current) {
            qr.append(ref.current);
        }
    }, [ref, qr]);

    return <div ref={ref} />;
};
