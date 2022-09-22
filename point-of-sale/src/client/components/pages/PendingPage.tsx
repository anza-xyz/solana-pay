import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NextPage } from 'next';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import BigNumber from "bignumber.js"
import { useConfig } from '../../hooks/useConfig';
import { usePayment } from '../../hooks/usePayment';
import { BackButton } from '../buttons/BackButton';
import { Amount } from '../sections/Amount';
import { PoweredBy } from '../sections/PoweredBy';
import { QRCode } from '../sections/QRCode';
import css from './PendingPage.module.css';

const PendingPage: NextPage = () => {
    const { symbol, connectWallet } = useConfig();
    const { amount, reset, setAmount } = usePayment();
    const { publicKey } = useWallet();
    const { setVisible } = useWalletModal();
    const { query } = useRouter()

    useEffect(() => {
        if (connectWallet && !publicKey) {
            setVisible(true);
        }
    }, [connectWallet, publicKey, setVisible]);

    useEffect(() => {
        if (query.amount) {
            setAmount(BigNumber(parseInt(query.amount as string)))
        }
    }, [query.amount, setAmount])

    return (
        <div className={css.root}>
            <div className={css.header}>
                <BackButton onClick={reset}>Cancel</BackButton>
                {connectWallet ? <WalletMultiButton /> : null}
            </div>
            <div className={css.main}>
                <div className={css.amount}>
                    <Amount amount={amount} />
                </div>
                <div className={css.symbol}>{symbol}</div>
                <div className={css.code}>
                    <QRCode />
                </div>
                <div className={css.scan}>Scan this code with your Solana Pay wallet</div>
                <div className={css.confirm}>You'll be asked to approve the transaction</div>
            </div>
            <div className={css.footer}>
                <PoweredBy />
            </div>
        </div>
    );
};

export default PendingPage;

export function getServerSideProps() {
    // Required so getInitialProps re-runs on the server-side
    // If it runs on client-side then there's no req and the URL reading doesn't work
    // See https://nextjs.org/docs/api-reference/data-fetching/get-initial-props
    return {
        props: {},
    };
}
