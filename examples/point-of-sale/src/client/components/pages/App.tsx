import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { GlowWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { PublicKey } from '@solana/web3.js';
import { AppContext, AppProps as NextAppProps, default as NextApp } from 'next/app';
import { AppInitialProps } from 'next/dist/shared/lib/utils';
import React, { useState, useEffect, FC, useCallback, useMemo, useRef } from 'react';
import { CURRENCY_LIST, DEVNET_ENDPOINT, MAINNET_ENDPOINT, MAX_VALUE } from '../../utils/constants';
import { ConfigProvider } from '../contexts/ConfigProvider';
import { FullscreenProvider } from '../contexts/FullscreenProvider';
import { PaymentProvider } from '../contexts/PaymentProvider';
import { ThemeProvider } from '../contexts/ThemeProvider';
import { TransactionsProvider } from '../contexts/TransactionsProvider';
import { SolanaPayLogo } from '../images/SolanaPayLogo';
import { ABOUT, APP_TITLE, CURRENCY, IS_CUSTOMER_POS, IS_DEV, SHOW_SYMBOL, USE_HTTP, USE_LINK, USE_WEB_WALLET, LANGUAGE, SHOW_MERCHANT_LIST } from '../../utils/env';
import css from './App.module.css';
import { ErrorProvider } from '../contexts/ErrorProvider';
import { MerchantInfo } from '../sections/Merchant';
import { MerchantCarousel } from '../sections/Carousel';
import { useRouter } from "next/router";
import { IntlProvider, FormattedMessage } from 'react-intl';
import { Digits } from "../../types";
import { isMobile } from "../../utils/isMobile";

interface AppProps extends NextAppProps {
    host: string;
    query: {
        id?: number;
        recipient?: string;
        label?: string;
        message?: string;
        currency?: string;
        maxValue?: number;
    };
}

const App: FC<AppProps> & { getInitialProps(appContext: AppContext): Promise<AppInitialProps>; } = ({
    Component,
    host,
    query,
    pageProps,
}) => {
    const baseURL = (USE_HTTP ? 'http' : 'https') + `://${host}`;

    // If you're testing without a mobile wallet, set USE_WEB_WALLET environment setting to true to allow a browser wallet to be used.
    const connectWallet = !isMobile() || USE_WEB_WALLET;
    const network = IS_DEV ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;

    const wallets = useMemo(
        () =>
            connectWallet
                ? [
                    new GlowWalletAdapter({ network }),
                    new PhantomWalletAdapter(),
                    new SolflareWalletAdapter({ network })
                ]
                : [],
        [connectWallet, network]
    );

    // Set USE_LINK environment setting to use transaction requests instead of transfer requests.
    const link = useMemo(() => USE_LINK ? new URL(`${baseURL}/api/`) : undefined, [baseURL]);

    const [label, setLabel] = useState('');
    const [recipient, setRecipient] = useState(new PublicKey(0));
    const [currency, setCurrency] = useState(CURRENCY);
    const [maxValue, setMaxValue] = useState(MAX_VALUE);
    const [id, setId] = useState(0);
    const [merchants, setMerchants] = useState<MerchantInfo[]>();

    const setInfo = useCallback((recipient: string, label: string, currency: string, maxValue: number) => {
        if (recipient && label) {
            try {
                setRecipient(new PublicKey(recipient));
                setLabel(label);
                setCurrency(currency ?? CURRENCY);
                setMaxValue(maxValue ?? MAX_VALUE);
            } catch (error) {
                console.error(error);
            }
        }
    }, []);

    const { id: idParam, message, recipient: recipientParam, label: labelParam, currency: currencyParam, maxValue: maxValueParam } = query;
    useEffect(() => {
        if (recipientParam && labelParam) {
            setInfo(recipientParam as string, labelParam as string, currencyParam as string, maxValueParam as number);
        } else if (idParam) {
            fetch(`${baseURL}/api/findMerchant?id=${idParam}`)
                .then(response => response.json())
                .then(data => {
                    const { address: recipient, company: label, currency, maxValue } = data;
                    setInfo(recipient, label, currency, maxValue);
                });
        } else if (SHOW_MERCHANT_LIST) {
            fetch(`${baseURL}/api/fetchMerchants`)
                .then(response => response.json())
                .then(data => {
                    setMerchants(data);
                });
        }
    }, [baseURL, idParam, query, labelParam, currencyParam, maxValueParam, recipientParam, setInfo]);

    const router = useRouter();
    const reset = useCallback(() => {
        router.replace(baseURL + '/new').then(() => {
            setId(idParam || 0);
            setRecipient(new PublicKey(0));
            setLabel('');
            setCurrency(CURRENCY);
            setMaxValue(MAX_VALUE);
        });
    }, [baseURL, router, idParam]);

    const [language, setLanguage] = useState(LANGUAGE);
    // const [isLangInit, setIsLangInit] = useState(false);
    const [messages, setMessages] = useState<Record<string, string>>({});
    const isLangInit = useRef(false);

    useEffect(() => {
        if (navigator) {
            const newLang = navigator.language;
            if (!isLangInit.current) {
                isLangInit.current = true;
                fetch(`${baseURL}/api/fetchMessages?locale=${newLang}`)
                    .then(response => response.json())
                    .then(data => {
                        setMessages(data);
                        setLanguage(newLang);
                        console.log(data);
                    });
            }
        }
    }, [baseURL]);
    useEffect(() => {
        if (document) {
            document.title = (label ? label + ' @ ' : '') + APP_TITLE;
        }
    }, [label]);

    const currencyDetail = CURRENCY_LIST[currency];
    const endpoint = IS_DEV ? DEVNET_ENDPOINT : MAINNET_ENDPOINT;
    const splToken = currencyDetail[0];
    const icon = React.createElement(currencyDetail[1]);
    const decimals = currencyDetail[2];
    const minDecimals = currencyDetail[3];
    const symbol = currencyDetail[4];

    const [maxDecimals, setMaxDecimals] = useState<Digits>(2);
    useEffect(() => {
        if (messages.about) {
            const basePattern = '{value}';
            const text = Number(1).toLocaleString(language, { style: "currency", currency: "EUR" });
            const onlyDecimal = text.replaceAll('1', '');
            const empty = onlyDecimal.replaceAll('0', '');
            const isCurrencyFirst = text[0] !== '1';
            const currencySpace = empty.length > 2 ? ' ' : '';
            const decimal = !isCurrencyFirst ? empty[0] : empty[empty.length - 1];
            setMaxDecimals((onlyDecimal.length - empty.length) as Digits);

            let displayCurrency;
            if (SHOW_SYMBOL) {
                try {
                    displayCurrency = Number(0).toLocaleString(language, { style: "currency", currency: symbol }).replaceAll('0', '').replaceAll(decimal, '').trim();
                } catch {
                    displayCurrency = symbol;
                }
            } else {
                displayCurrency = currency;
            }
            displayCurrency = "<span>" + displayCurrency + "</span>";

            messages.currencyPattern = isCurrencyFirst ? displayCurrency + currencySpace + basePattern : basePattern + currencySpace + displayCurrency;
        }
    }, [currency, symbol, language, messages]);

    return (messages.about ?
        <IntlProvider locale={language} messages={messages} defaultLocale={LANGUAGE}>
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
                                            maxDecimals={maxDecimals}
                                            currency={currency}
                                            maxValue={maxValue}
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
                                currency={currency}
                                maxValue={maxValue}
                            >
                                <div className={css.title}><FormattedMessage id="merchants" /></div>
                                <MerchantCarousel merchants={merchants} id={id} alt={messages.merchantLogo} />
                                <div className={css.about}>
                                    <a className={css.link} href={ABOUT} target="_blank" rel="noreferrer">
                                        <FormattedMessage id="about" />
                                    </a>
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
        </IntlProvider >
        : null);
};

App.getInitialProps = async (appContext) => {
    const props = await NextApp.getInitialProps(appContext);

    const { query, req } = appContext.ctx;
    const id = query.id || undefined;
    const recipient = query.recipient || undefined;
    const label = query.label || undefined;
    const message = query.message || undefined;
    const currency = query.currency || CURRENCY;
    const maxValue = query.maxValue || MAX_VALUE;
    const host = req?.headers.host || 'localhost:' + (USE_HTTP ? '3000' : '3001');

    return {
        ...props,
        query: { id, recipient, label, message, currency, maxValue },
        host,
    };
};

export default App;
