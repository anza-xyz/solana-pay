import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus';
import { PublicKey } from '@solana/web3.js';
import React, { FC, ReactNode, useEffect, useMemo } from 'react';
import { ConfigProvider } from './hooks/useConfig';
import { PaymentProvider, PaymentStatus, usePayment } from './hooks/usePayment';
import { ThemeProvider } from './hooks/useTheme';
import { AmountPage } from './pages/AmountPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { QRPage } from './pages/QRPage';
import { toggleFullscreen } from './utils/toggleFullscreen';

require('@solana/wallet-adapter-react-ui/styles.css');

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
    const wallets = useMemo(() => [new PhantomWalletAdapter(), new TorusWalletAdapter()], []);
    const account = useMemo(() => new PublicKey('GvHeR432g7MjN9uKyX3Dzg66TqwrEWgANLnnFZXMeyyj'), []);
    const token = useMemo(() => new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'), []);

    return (
        <ThemeProvider>
            <ConnectionProvider endpoint="https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/">
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <ConfigProvider
                            label="Starbucks"
                            account={account}
                            token={token}
                            symbol="USDC"
                            decimals={6}
                            minDecimals={2}
                            requiredConfirmations={9}
                        >
                            <PaymentProvider>{children}</PaymentProvider>
                        </ConfigProvider>
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </ThemeProvider>
    );
};

const Content: FC = () => {
    const { status } = usePayment();
    switch (status) {
        case PaymentStatus.New:
            return <AmountPage />;
        case PaymentStatus.Waiting:
            return <QRPage />;
        default:
            return <ConfirmationPage />;
    }
};
