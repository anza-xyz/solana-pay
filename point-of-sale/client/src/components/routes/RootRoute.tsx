import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus';
import { PublicKey } from '@solana/web3.js';
import React, { FC, useMemo } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { DEVNET_ENDPOINT } from '../../utils/constants';
import { ConfigProvider } from '../contexts/ConfigProvider';
import { FullscreenProvider } from '../contexts/FullscreenProvider';
import { PaymentProvider } from '../contexts/PaymentProvider';
import { ThemeProvider } from '../contexts/ThemeProvider';
import { TransactionsProvider } from '../contexts/TransactionsProvider';
import { SolanaPayLogo } from '../images/SolanaPayLogo';
import { SOLIcon } from '../images/SOLIcon';
import * as css from './RootRoute.module.pcss';

export const RootRoute: FC = () => {
    // If you're testing without a mobile wallet, set this to true to allow a browser wallet to be used
    const connectWallet = true;
    const wallets = useMemo(
        () => (connectWallet ? [new PhantomWalletAdapter(), new TorusWalletAdapter()] : []),
        [connectWallet]
    );

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

    const link = useMemo(() => new URL('https://localhost:3001'), []);

    return (
        <ThemeProvider>
            <FullscreenProvider>
                {recipient && label ? (
                    <ConnectionProvider endpoint={DEVNET_ENDPOINT}>
                        <WalletProvider wallets={wallets} autoConnect={connectWallet}>
                            <WalletModalProvider>
                                <ConfigProvider
                                    link={link}
                                    recipient={recipient}
                                    label={label}
                                    symbol="SOL"
                                    icon={<SOLIcon />}
                                    decimals={9}
                                    minDecimals={1}
                                    requiredConfirmations={9}
                                    connectWallet={connectWallet}
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
                ) : (
                    <div className={css.logo}>
                        <SolanaPayLogo width={240} height={88} />
                    </div>
                )}
            </FullscreenProvider>
        </ThemeProvider>
    );
};
