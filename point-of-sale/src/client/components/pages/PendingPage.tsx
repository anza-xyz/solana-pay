import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NextPage } from 'next';
import React, { useEffect } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { usePayment } from '../../hooks/usePayment';
import { IS_MERCHANT_POS, SHOW_SYMBOL } from '../../utils/env';
import { BackButton } from '../buttons/BackButton';
import { Amount } from '../sections/Amount';
import { PoweredBy } from '../sections/PoweredBy';
import { QRCode } from '../sections/QRCode';
import css from './PendingPage.module.css';

const PendingPage: NextPage = () => {
    const { symbol, currency, label, connectWallet } = useConfig();
    const { amount, reset } = usePayment();
    const { publicKey } = useWallet();
    const { setVisible } = useWalletModal();

    useEffect(() => {
        if (connectWallet && !publicKey) {
            setVisible(true);
        }
    }, [connectWallet, publicKey, setVisible]);

    // TODO : Add translation
    return (
        <div className={css.root}>
            <div className={css.header}>
                <BackButton onClick={reset}>Annuler</BackButton>
                {connectWallet && IS_MERCHANT_POS ? <WalletMultiButton /> : null}
            </div>
            <div className={css.main}>
                <div className={css.symbol}>{label}</div>
                <div className={css.amount}>
                    {SHOW_SYMBOL ? symbol : null}
                    <Amount amount={amount} />
                </div>
                {!SHOW_SYMBOL ? <div className={css.symbol}>{currency}</div> : null}

                {IS_MERCHANT_POS ? (
                    <div>
                        <div className={css.code}>
                            <QRCode />
                        </div>
                        <div className={css.scan}>Scan this code with your Solana Pay wallet</div>
                        <div className={css.confirm}>You&apos;ll be asked to approve the transaction</div>
                    </div>
                ) : (
                    <div>
                        <div className={css.scan}></div>
                        <div className={css.confirm}>Merci de confirmer la transaction.</div>
                    </div>
                )}
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
