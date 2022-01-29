import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus';
import { PublicKey } from '@solana/web3.js';
import React, { FC, useMemo } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { USDCIcon } from './components/images/USDCIcon';
import { ConfigProvider } from './hooks/useConfig';
import { PaymentProvider } from './hooks/usePayment';
import { ThemeProvider } from './hooks/useTheme';
import { TransactionsProvider } from './hooks/useTransactions';
import { MAINNET_ENDPOINT, MAINNET_USDC_MINT } from './utils/constants';

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
            <ConnectionProvider endpoint={MAINNET_ENDPOINT}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <ConfigProvider
                            recipient={recipient}
                            label={label}
                            splToken={MAINNET_USDC_MINT}
                            symbol="USDC"
                            icon={<USDCIcon />}
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
