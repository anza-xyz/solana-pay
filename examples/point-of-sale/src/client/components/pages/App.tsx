import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { PublicKey } from '@solana/web3.js';
import { AppContext, AppProps as NextAppProps, default as NextApp } from 'next/app';
import { AppInitialProps } from 'next/dist/shared/lib/utils';
import React, { useState, useEffect, FC, useCallback, useMemo } from 'react';
import { ABOUT, CURRENCY_LIST, DEVNET_ENDPOINT, MAINNET_ENDPOINT, MAX_VALUE } from '../../utils/constants';
import { ConfigProvider } from '../contexts/ConfigProvider';
import { FullscreenProvider } from '../contexts/FullscreenProvider';
import { PaymentProvider } from '../contexts/PaymentProvider';
import { ThemeProvider } from '../contexts/ThemeProvider';
import { TransactionsProvider } from '../contexts/TransactionsProvider';
import { SolanaPayLogo } from '../images/SolanaPayLogo';
import { CURRENCY, IS_DEV, IS_MERCHANT_POS, USE_SSL } from '../../utils/env';
import css from './App.module.css';
import { ErrorProvider } from '../contexts/ErrorProvider';
import { MerchantInfo } from '../sections/Merchant';
import { MerchantCarousel } from '../sections/Carousel';
import { useRouter } from "next/router";
import Link from "next/link";

interface AppProps extends NextAppProps {
    host: string;
    query: {
        id?: number;
        recipient?: string;
        label?: string;
        message?: string;
        maxValue?: number;
    };
}

const App: FC<AppProps> & { getInitialProps(appContext: AppContext): Promise<AppInitialProps>; } = ({
    Component,
    host,
    query,
    pageProps,
}) => {
    const baseURL = (USE_SSL ? 'https' : 'http') + `://${host}`;
    useEffect(() => {
        document.title = (label ? label + ' @ ' : '') + 'FiMs Pay';
    });

    // If you're testing without a mobile wallet, set this to true to allow a browser wallet to be used.
    const connectWallet = !IS_MERCHANT_POS || false;
    // If you're testing without a mobile wallet, set this to Devnet or Mainnet to configure some browser wallets.
    const network = IS_DEV ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;

    const wallets = useMemo(
        () =>
            connectWallet
                ? [
                    new SolflareWalletAdapter({ network }),
                ]
                : [],
        [connectWallet, network]
    );

    // Toggle comments on these lines to use transaction requests instead of transfer requests.
    const link = undefined;
    // const link = useMemo(() => new URL(`${baseURL}/api/`), [baseURL]);

    const [label, setLabel] = useState('');
    const [recipient, setRecipient] = useState(new PublicKey(0));
    const [maxValue, setMaxValue] = useState(MAX_VALUE);
    const [id, setId] = useState(0);
    const [merchants, setMerchants] = useState<MerchantInfo[]>();

    const setInfo = useCallback((recipient: string, label: string, maxValue: number) => {
        if (recipient && label) {
            try {
                setRecipient(new PublicKey(recipient));
                setLabel(label);
                setMaxValue(maxValue ?? MAX_VALUE);
            } catch (error) {
                console.error(error);
            }
        }
    }, []);

    const { id: idParam, message, recipient: recipientParam, label: labelParam, maxValue: maxValueParam } = query;
    useEffect(() => {
        if (recipientParam && labelParam) {
            setInfo(recipientParam as string, labelParam as string, maxValueParam as number);
        } else if (idParam) {
            fetch(`${baseURL}/api/findMerchant?id=${idParam}`)
                .then((response) => response.json())
                .then((data) => {
                    const { address: recipient, company: label, maxValue } = data;
                    setInfo(recipient, label, maxValue);
                });
        } else {
            fetch(`${baseURL}/api/fetchMerchants`)
                .then((response) => response.json())
                .then((data) => {
                    setMerchants(data);
                });
        }
    }, [baseURL, idParam, query, labelParam, maxValueParam, recipientParam, setInfo]);

    const router = useRouter();
    const reset = useCallback(() => {
        router.replace(baseURL + '/new');
        setLabel('');
        setRecipient(new PublicKey(0));
        setMaxValue(MAX_VALUE);
        setId(idParam || 0);
    }, [baseURL, router, idParam]);

    const currency = CURRENCY;
    const currencyDetail = CURRENCY_LIST[currency];
    const endpoint = IS_DEV ? DEVNET_ENDPOINT : MAINNET_ENDPOINT;
    const splToken = currencyDetail[0];
    const icon = React.createElement(currencyDetail[1]);
    const decimals = currencyDetail[2];
    const minDecimals = currencyDetail[3];
    const symbol = currencyDetail[4];

    // TODO : Translation
    return (
        <ErrorProvider>
            <ThemeProvider>
                <FullscreenProvider>
                    {recipient && label ? (
                        <ConnectionProvider endpoint={endpoint}>
                            <WalletProvider wallets={wallets} autoConnect={connectWallet}>
                                <WalletModalProvider>
                                    <ConfigProvider
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
                                        reset={reset}
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
                    ) : merchants && merchants.length > 0 ? (
                        <ConfigProvider
                            recipient={recipient}
                            label={label}
                            symbol={symbol}
                            icon={icon}
                            decimals={decimals}
                            maxValue={maxValue}
                            currency={currency}
                        >
                            <div className={css.title}>Liste des Commerçants</div>
                            <MerchantCarousel merchants={merchants} id={id} />
                            <div className={css.about}><a className={css.link} href={ABOUT.toString()} target="_blank" rel="noreferrer">En savoir plus</a></div>
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