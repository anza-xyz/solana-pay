import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import App, { AppContext, AppProps } from 'next/app';
import { useMemo } from 'react';
import { FullscreenProvider } from '../components/contexts/FullscreenProvider';
import { ThemeProvider } from '../components/contexts/ThemeProvider';
import { DEVNET_ENDPOINT } from '../utils/constants';
import { SolanaPayLogo } from '../components/images/SolanaPayLogo';
import { SOLIcon } from '../components/images/SOLIcon';
import { ConfigProvider } from '../components/contexts/ConfigProvider';
import { TransactionsProvider } from '../components/contexts/TransactionsProvider';
import { PaymentProvider } from '../components/contexts/PaymentProvider';
import { PublicKey } from '@solana/web3.js';
import css from './_app.module.css';
import '../index.css';
interface MyAppProps extends AppProps {
    query: {
        recipient?: string;
        label?: string;
    }
}

function MyApp({ Component, pageProps, query }: MyAppProps) {
    // If you're testing without a mobile wallet, set this to true to allow a browser wallet to be used
    const connectWallet = true;
    const wallets = useMemo(
        () => (connectWallet ? [new PhantomWalletAdapter(), new TorusWalletAdapter()] : []),
        [connectWallet]
    );

    let recipient: PublicKey | undefined = undefined
    const { recipient: recipientParam, label } = query;
    if (recipientParam && label) {
        try {
            recipient = new PublicKey(recipientParam);
        } catch (error) {
            console.error(error);
        }
    }

    const link = useMemo(() => new URL('https://localhost:3001/api'), []);

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
                                    connectWallet={connectWallet}
                                >
                                    <TransactionsProvider>
                                        <PaymentProvider>
                                            <Component {...pageProps} />
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
    )
};

MyApp.getInitialProps = async (appContext: AppContext) => {
    const { query } = appContext.ctx
    const recipient = query.recipient as string;
    const label = query.label as string;

    const appProps = await App.getInitialProps(appContext);
    return {
        ...appProps,
        query: { recipient, label }
    }
}

export default MyApp;
