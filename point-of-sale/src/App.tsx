import { Keypair } from '@solana/web3.js';
import React, { FC, ReactNode, useEffect } from 'react';
import { ConfigProvider } from './hooks/useConfig';
import { ConnectionProvider } from './hooks/useConnection';
import { PaymentProvider, usePayment } from './hooks/usePayment';
import { ThemeProvider } from './hooks/useTheme';
import { AmountPage } from './pages/AmountPage';
import { QRPage } from './pages/QRPage';

export const App: FC = () => {
    useEffect(() => {
        const toggleFullScreen = (event: KeyboardEvent) => {
            if (event.key !== 'Enter') return;

            const doc = document as any;
            const el = doc.documentElement;
            const isFullscreen =
                doc.fullscreenElement ||
                doc.webkitFullscreenElement ||
                doc.mozFullScreenElement ||
                doc.msFullscreenElement;

            if (isFullscreen) {
                const close =
                    doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
                if (close) {
                    close();
                }
            } else {
                const open =
                    el.requestFullScreen ||
                    el.webkitRequestFullscreen ||
                    el.mozRequestFullScreen ||
                    el.msRequestFullscreen;
                if (open) {
                    open();
                }
            }
        };

        document.addEventListener('keydown', toggleFullScreen, false);
        return () => document.removeEventListener('keydown', toggleFullScreen, false);
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
            <ConfigProvider
                account={Keypair.generate().publicKey}
                token={Keypair.generate().publicKey}
                symbol="USDC"
                decimals={6}
                label="Starbucks"
            >
                <PaymentProvider>
                    <ConnectionProvider>{children}</ConnectionProvider>
                </PaymentProvider>
            </ConfigProvider>
        </ThemeProvider>
    );
};

const Content: FC = () => {
    const { reference } = usePayment();
    return reference ? <QRPage /> : <AmountPage />;
};
