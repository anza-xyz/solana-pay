import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus';
import { PublicKey } from '@solana/web3.js';
import base58 from 'bs58';
import React, { FC, useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { USDC } from './components/USDC';
import { ConfigProvider } from './hooks/useConfig';
import { PaymentProvider } from './hooks/usePayment';
import { ThemeProvider } from './hooks/useTheme';
import { TransactionsProvider } from './hooks/useTransactions';
import { ENDPOINT, TOKEN } from './utils/constants';

export const App: FC = () => {
    const wallets = useMemo(() => [new PhantomWalletAdapter(), new TorusWalletAdapter()], []);

    const { config } = useParams();
    const { recipient, label } = useMemo(() => {
        let recipient: PublicKey | undefined, label: string | undefined;

        if (config) {
            try {
                const params = JSON.parse(base58.decode(config).toString());
                if (typeof params.recipient === 'string') {
                    recipient = new PublicKey(params.recipient);
                }
                if (typeof params.label === 'string') {
                    label = params.label;
                }
            } catch (error) {
                console.error(error);
            }
        }

        return { recipient, label };
    }, [config]);

    return recipient && label ? (
        <ThemeProvider>
            <ConnectionProvider endpoint={ENDPOINT}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <ConfigProvider
                            recipient={recipient}
                            label={label}
                            token={TOKEN}
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
    ) : null;
};
