import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import React, { FC, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { USDC } from './components/USDC';
import { ConfigProvider } from './hooks/useConfig';
import { PaymentProvider } from './hooks/usePayment';
import { ThemeProvider } from './hooks/useTheme';
import { TransactionsProvider } from './hooks/useTransactions';

require('@solana/wallet-adapter-react-ui/styles.css');

export const App: FC = () => {
    // TODO: move config to URL
    const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
    const wallets = useMemo(() => [new PhantomWalletAdapter(), new TorusWalletAdapter()], []);
    const recipient = useMemo(() => new PublicKey('GvHeR432g7MjN9uKyX3Dzg66TqwrEWgANLnnFZXMeyyj'), []);
    const token = useMemo(() => new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'), []);

    return (
        <ThemeProvider>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <ConfigProvider
                            recipient={recipient}
                            label="Starbucks"
                            token={token}
                            icon={<USDC />}
                            symbol="USDC"
                            decimals={6}
                            minDecimals={2}
                            requiredConfirmations={9}
                        >
                            <TransactionsProvider>
                                <PaymentProvider>
                                    <Outlet />
                                </PaymentProvider>
                            </TransactionsProvider>
                        </ConfigProvider>
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </ThemeProvider>
    );
};
