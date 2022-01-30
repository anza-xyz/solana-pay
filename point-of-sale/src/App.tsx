import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus';
import { PublicKey } from '@solana/web3.js';
import React, { FC, useMemo } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { SOLIcon } from './components/images/SOLIcon';
import { ConfigProvider } from './hooks/useConfig';
import { PaymentProvider } from './hooks/usePayment';
import { ThemeProvider } from './hooks/useTheme';
import { TransactionsProvider } from './hooks/useTransactions';
import { DEVNET_ENDPOINT } from './utils/constants';

export const App: FC = () => {
    const wallets = useMemo(() => [new PhantomWalletAdapter(), new TorusWalletAdapter()], []);

    const [params] = useSearchParams();
    const { recipient, label } = useMemo(() => {
        let recipient: PublicKey | undefined, label: string | undefined;

        const recipientParam = params.get('recipient');
        const labelParam = params.get('label');
        if (recipientParam && labelParam) {
            try {
                recipient = new PublicKey(recipientParam);
                label = labelParam;
            } catch (error) {
                console.error(error);
            }
        }

        return { recipient, label };
    }, [params]);

    return recipient && label ? (
        <ThemeProvider>
            <ConnectionProvider endpoint={DEVNET_ENDPOINT}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <ConfigProvider
                            recipient={recipient}
                            label={label}
                            symbol="SOL"
                            icon={<SOLIcon />}
                            decimals={9}
                            minDecimals={1}
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
