import { createQROptions } from '@solana/pay';
import QRCodeStyling from '@solana/qr-code-styling';
import React, { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { usePayment } from '../../hooks/usePayment';
import { useTheme } from '../../hooks/useTheme';
import * as css from './QRCode.module.pcss';

export const QRCode: FC = () => {
    const [size, setSize] = useState(() => typeof window === 'undefined' ? 400 : Math.min(window.screen.availWidth, 400));
    useLayoutEffect(() => {
        const listener = () => setSize(Math.min(window.screen.availWidth, 400));

        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [])

    const { url } = usePayment();
    const options = useMemo(() => createQROptions(url, size, 'transparent', '#2a2a2a'), [url, size]);

    const qr = useMemo(() => new QRCodeStyling(), []);
    useLayoutEffect(() => qr.update(options), [qr, options]);

    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (ref.current) {
            qr.append(ref.current);
        }
    }, [ref, qr]);

    return <div ref={ref} className={css.root} />;
};
