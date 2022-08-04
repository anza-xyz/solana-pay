import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { AppContext, AppProps as NextAppProps, default as NextApp } from 'next/app';
import { AppInitialProps } from 'next/dist/shared/lib/utils';
import { FC, useMemo } from 'react';
import { CURRENCY_LIST, DEVNET_ENDPOINT, MAINNET_ENDPOINT, MAX_VALUE } from '../../utils/constants';
import { ConfigProvider } from '../contexts/ConfigProvider';
import { FullscreenProvider } from '../contexts/FullscreenProvider';
import { PaymentProvider } from '../contexts/PaymentProvider';
import { ThemeProvider } from '../contexts/ThemeProvider';
import { TransactionsProvider } from '../contexts/TransactionsProvider';
import { SolanaPayLogo } from '../images/SolanaPayLogo';
import { CURRENCY, IS_DEV, IS_MERCHANT_POS, USE_SSL } from '../../utils/env';
import React, { useState, useEffect } from 'react';
import css from './App.module.css';
import { ErrorProvider } from '../contexts/ErrorProvider';
import { Merchant, MerchantInfo } from '../sections/Merchant';

interface AppProps extends NextAppProps {
    host: string;
    query: {
        id?: string;
        recipient?: string;
        label?: string;
        message?: string;
        maxValue?: number;
    };
}

const App: FC<AppProps> & { getInitialProps(appContext: AppContext): Promise<AppInitialProps> } = ({
    Component,
    host,
    query,
    pageProps,
}) => {
    const baseURL = (USE_SSL ? 'https' : 'http') + `://${host}`;

    // If you're testing without a mobile wallet, set this to true to allow a browser wallet to be used.
    const connectWallet = !IS_MERCHANT_POS || false;
    const network = IS_DEV ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;
    const wallets = useMemo(
        () => (connectWallet ? [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })] : []),
        [connectWallet, network]
    );

    // Toggle comments on these lines to use transaction requests instead of transfer requests.
    const link = undefined;
    // const link = useMemo(() => new URL(`${baseURL}/api/`), [baseURL]);

    const [label, setLabel] = useState('');
    const [recipient, setRecipient] = useState(new PublicKey(0));
    const [maxValue, setMaxValue] = useState(MAX_VALUE);
    const [merchants, setMerchants] = useState<MerchantInfo[]>();

    const { id, message } = query;
    useEffect(() => {
        if (IS_MERCHANT_POS) {
            const { recipient, label, maxValue } = query;
            a(recipient as string, label as string, maxValue as number);
        } else {
            if (id) {
                fetch(`${baseURL}/api/findMerchant?id=${id}`)
                    .then((response) => response.json())
                    .then((data) => {
                        const { address: recipient, company: label, maxValue } = data;
                        a(recipient, label, maxValue);
                    });
            } else {
                fetch(`${baseURL}/api/fetchMerchants`)
                    .then((response) => response.json())
                    .then((data) => {
                        setMerchants(data);
                    });
            }
        }
    }, [baseURL, id, query]);

    const a = (recipient: string, label: string, maxValue: number) => {
        if (recipient && label) {
            try {
                setRecipient(new PublicKey(recipient));
                setLabel(label);
                setMaxValue(maxValue);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const currency = CURRENCY;
    const currencyDetail = CURRENCY_LIST[currency];
    const endpoint = IS_MERCHANT_POS ? (IS_DEV ? DEVNET_ENDPOINT : MAINNET_ENDPOINT) : clusterApiUrl(network);
    const splToken = currencyDetail[0];
    const icon = React.createElement(currencyDetail[1]);
    const decimals = currencyDetail[2];
    const minDecimals = currencyDetail[3];
    const symbol = currencyDetail[4];

    return (
        <ErrorProvider>
            <ThemeProvider>
                <FullscreenProvider>
                    {recipient && label ? (
                        <ConnectionProvider endpoint={endpoint}>
                            <WalletProvider wallets={wallets} autoConnect={connectWallet}>
                                <WalletModalProvider>
                                    <ConfigProvider
                                        baseURL={baseURL}
                                        link={link}
                                        recipient={recipient}
                                        label={label}
                                        message={message}
                                        splToken={splToken}
                                        symbol={symbol}
                                        icon={icon}
                                        decimals={decimals}
                                        minDecimals={minDecimals}
                                        maxValue={maxValue}
                                        currency={currency}
                                        id={id}
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
                    ) : merchants ? (
                        <ConfigProvider
                            baseURL={baseURL}
                            recipient={recipient}
                            label={label}
                            symbol={symbol}
                            icon={icon}
                            decimals={decimals}
                            maxValue={maxValue}
                            currency={currency}
                        >
                            <div>
                                {merchants.map((merchant) => (
                                    <Merchant key={merchant.index} merchant={merchant} />
                                ))}
                            </div>
                        </ConfigProvider>
                    ) : (
                        <div className={css.logo}>
                            <SolanaPayLogo width={240} height={88} />
                        </div>
                    )}
                </FullscreenProvider>
            </ThemeProvider>
        </ErrorProvider>
    );
};

App.getInitialProps = async (appContext) => {
    const props = await NextApp.getInitialProps(appContext);

    const { query, req } = appContext.ctx;
    const id = query.id || undefined;
    const recipient = query.recipient || undefined;
    const label = query.label || undefined;
    const message = query.message || undefined;
    const maxValue = query.maxValue || MAX_VALUE;
    const host = req?.headers.host || 'localhost:' + (USE_SSL ? '3001' : '3000');

    return {
        ...props,
        query: { id, recipient, label, message, maxValue },
        host,
    };
};

export default App;
