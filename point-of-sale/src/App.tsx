import { Keypair } from '@solana/web3.js';
import React, { FC, ReactNode, useEffect } from 'react';
import { ConfigProvider } from './hooks/useConfig';
import { ConnectionProvider } from './hooks/useConnection';
import { PaymentProvider, usePayment } from './hooks/usePayment';
import { ThemeProvider } from './hooks/useTheme';
import { AmountPage } from './pages/AmountPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { QRPage } from './pages/QRPage';
import { toggleFullscreen } from './utils/toggleFullscreen';

export const App: FC = () => {
    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if (event.key !== 'Enter') return;
            toggleFullscreen();
        };

        document.addEventListener('keydown', listener, false);
        return () => document.removeEventListener('keydown', listener, false);
    }, []);

    return (
        <Context>
            <Content />
        </Context>
    );
};

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <ThemeProvider>
            <ConnectionProvider>
                <ConfigProvider
                    account={Keypair.generate().publicKey}
                    token={Keypair.generate().publicKey}
                    symbol="USDC"
                    decimals={6}
                    minDecimals={2}
                    label="Starbucks"
                >
                    <PaymentProvider>{children}</PaymentProvider>
                </ConfigProvider>
            </ConnectionProvider>
        </ThemeProvider>
    );
};

const Content: FC = () => {
    const { reference, signature } = usePayment();
    if (signature) return <ConfirmationPage />;
    if (reference) return <QRPage />;
    return <AmountPage />;
};
