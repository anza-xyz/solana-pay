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
import { CURRENCY, IS_DEV, IS_MERCHANT_POS, SHOW_SYMBOL, USE_SSL } from '../../utils/env';
import css from './App.module.css';
import { ErrorProvider } from '../contexts/ErrorProvider';
import { MerchantInfo } from '../sections/Merchant';
import { MerchantCarousel } from '../sections/Carousel';
import { useRouter } from "next/router";
import { IntlProvider, FormattedMessage } from 'react-intl';
import { Digits } from "../../types";

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
                .then(response => response.json())
                .then(data => {
                    const { address: recipient, company: label, maxValue } = data;
                    setInfo(recipient, label, maxValue);
                });
        } else {
            fetch(`${baseURL}/api/fetchMerchants`)
                .then(response => response.json())
                .then(data => {
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

    const [language, setLanguage] = useState('en');
    useEffect(() => {
        document.title = (label ? label + ' @ ' : '') + 'FiMs Pay';
        setLanguage(navigator.language);
    }, [label]);

    const basePattern = '{value}';
    const [currencyPattern, setCurrencyPattern] = useState(basePattern);
    const [maxDecimals, setMaxDecimals] = useState<Digits>(2);
    useEffect(() => {
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

        setCurrencyPattern(isCurrencyFirst ? displayCurrency + currencySpace + basePattern : basePattern + currencySpace + displayCurrency);
    }, [currency, currencyPattern, symbol, language]);

    // TODO : Translation
    const messages = {
        'en': {
            "merchants": "List of Merchants",
            "about": "Learn more...",
            "newPayment": "New Payment",
            "cancel": "Cancel",
            "retry": "Retry",
            "back": "Back",
            "total": "Total",
            "balance": "Balance",
            "createTransaction": "Creating transaction...",
            "approveTransaction": "Please approve the transaction!",
            "sendTransaction": "Sending transaction...",
            "verifyTransaction": "Verifying...",
            "scanCode": "Scan this code with your Solana Pay wallet",
            "reinit": "Resetting...",
            "toPay": "To Pay:",
            "poweredBy": "Powered By",
            "balanceLoading": "Loading your Balance...",
            "emptyBalance": "NO BALANCE!",
            "insufficient": " [INSUFFICIENT]",
            "yourBalance": "Your Balance: ",
            "New": "New",
            "Pending": "In progress",
            "Creating": "Creating",
            "Sent": "Sent",
            "Confirmed": "Confirmed",
            "Valid": "Valid",
            "Invalid": "Invalid",
            "Finalized": "Finished",
            "Error": "Error",
            "connecting": "Connecting...",
            "connect": "Connect",
            "reload": "Reload",
            "supply": "Supply",
            "pay": "Pay",
            "at": "at",
            "generateCode": "Generate payment code",
            "WalletSignTransactionError": "You declined the transaction!",
            "WalletSendTransactionError": "You took too long to approve the transaction!",
            "TokenAccountNotFoundError": "You need to add \"{currency}\" to your wallet!",
            "insufficient SOL funds to pay for transaction fee": "You lack SOL to pay transaction fees!",
            "sender is also recipient": "You are both payer and paid at the same time",
            "sender not found": "The currency \"{currency}\" in your wallet could not be found!",
            "sender owner invalid": "Your wallet is invalid!",
            "sender executable": "Your wallet is an executable / program!",
            "recipient not found": "The currency \"{currency}\" in this merchant's wallet could not be found!",
            "recipient owner invalid": "This merchant's wallet is invalid!",
            "recipient executable": "This merchant's wallet is an executable/program!",
            "amount decimals invalid": "The number of decimals of the amount is invalid!",
            "mint not initialized": "The currency \"{currency}\" needs to be initialized!",
            "sender not initialized": "Your wallet needs to be initialized!",
            "sender frozen": "Your wallet is frozen, probably due to fraud!",
            "recipient not initialized": "This merchant's wallet needs to be initialized!",
            "recipient frozen": "This merchant's wallet is frozen, possibly due to fraud!",
            "insufficient funds": "The amount is more than your funds!",
            "CreateTransferError": "Transfer error!",
            "NetworkBusyError": "The network is temporarily busy, please try again!",
            "UnknownError": "Unknown error: {error}",
        },
        'fr': {
            "merchants": "Liste des Commerçants",
            "about": "En savoir plus...",
            "newPayment": "Nouveau Paiement",
            "cancel": "Annuler",
            "retry": "Réessayer",
            "back": "Retour",
            "total": "Total",
            "balance": "Solde",
            "createTransaction": "Création de la transaction ...",
            "approveTransaction": "Merci d'approuver la transaction !",
            "sendTransaction": "Envoi de la transaction ...",
            "verifyTransaction": "Vérification en cours ...",
            "scanCode": "Scannez ce code avec votre porte-monnaie Solana Pay",
            "reinit": "Réinitialisation ...",
            "toPay": "À Payer :",
            "poweredBy": "Propulsé par ",
            "balanceLoading": "Chargement de votre Solde ...",
            "emptyBalance": "AUCUN SOLDE !",
            "insufficient": " [INSUFFISANT]",
            "yourBalance": "Votre Solde : ",
            "New": "Nouveau",
            "Pending": "En cours",
            "Creating": "Création",
            "Sent": "Envoyé",
            "Confirmed": "Confirmé",
            "Valid": "Valide",
            "Invalid": "Invalide",
            "Finalized": "Terminé",
            "Error": "Erreur",
            "connecting": "Connexion ...",
            "connect": "Se connecter",
            "reload": "Recharger",
            "supply": "S'approvisionner",
            "pay": "Payer",
            "at": "à",
            "generateCode": "Générer code de paiement",
            "WalletSignTransactionError": "Vous avez refusé la transaction !",
            "WalletSendTransactionError": "Vous avez trop tardé à approuver la transaction !",
            "TokenAccountNotFoundError": "Vous devez ajouter la monnaie \"{currency}\" à votre porte-monnaie !",
            "insufficient SOL funds to pay for transaction fee": "Vous manquez de SOL pour payer les frais de transaction !",
            "sender is also recipient": "Vous êtes en même temps payeur et payé",
            "sender not found": "La monnaie \"{currency}\" dans votre porte-monnaie est introuvable !",
            "sender owner invalid": "Votre porte-monnaie est invalide !",
            "sender executable": "Votre porte-monnaie est un exécutable / programme !",
            "recipient not found": "La monnaie \"{currency}\" dans le porte-monnaie de ce commerçant est introuvable !",
            "recipient owner invalid": "Le porte-monnaie de ce commerçant est invalide !",
            "recipient executable": "Le porte-monnaie de ce commerçant est un exécutable / programme !",
            "amount decimals invalid": "Le nombre de décimales du montant est invalide !",
            "mint not initialized": "La monnaie \"{currency}\" a besoin d'être initialisé !",
            "sender not initialized": "Votre porte-monnaie a besoin d'être initialisé !",
            "sender frozen": "Votre porte-monnaie est gelé, probablement dû à une fraude !",
            "recipient not initialized": "Le porte-monnaie de ce commerçant a besoin d'être initialisé !",
            "recipient frozen": "Le porte-monnaie de ce commerçant est gelé, probablement dû à une fraude !",
            "insufficient funds": "Le montant est supérieur à vos fonds !",
            "CreateTransferError": "Erreur de transfert !",
            "NetworkBusyError": "Le réseau est momentanément saturé, merci de réessayer !",
            "UnknownError": "Erreur inconnue : {error}",
        }
    };

    return (
        <IntlProvider locale={language} messages={messages[language as keyof typeof messages]} defaultLocale="en">
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
                                            maxValue={maxValue}
                                            currency={currency}
                                            currencyPattern={currencyPattern}
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
                                <div className={css.title}><FormattedMessage id="merchants" /></div>
                                <MerchantCarousel merchants={merchants} id={id} />
                                <div className={css.about}>
                                    <a className={css.link} href={ABOUT.toString()} target="_blank" rel="noreferrer">
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
