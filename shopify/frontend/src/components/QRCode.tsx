
import { createQROptions } from '@solana/pay';
import QRCodeStyling from 'qr-code-styling';
import React, { FC, useLayoutEffect, useMemo, useRef } from 'react';
import { useSession } from '../hooks/useSession';

export const QRCode: FC = () => {
  const { paymentUrl } = useSession();
  const options = useMemo(() => createQROptions(paymentUrl, 256, '#EFF2F3', '#2A2A2A'), []);

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
