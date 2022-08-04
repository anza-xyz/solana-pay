import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NextPage } from 'next';
import React, { useEffect, useMemo } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import { IS_MERCHANT_POS, SHOW_SYMBOL } from '../../utils/env';
import { BackButton } from '../buttons/BackButton';
import { GenerateButton } from '../buttons/GenerateButton';
import { Error } from '../sections/Error';
import { PoweredBy } from '../sections/PoweredBy';
import { QRCode } from '../sections/QRCode';
import { TransactionInfo } from '../sections/TransactionInfo';
import css from './PendingPage.module.css';

const PendingPage: NextPage = () => {
    const { connectWallet } = useConfig();
    const { reset, status } = usePayment();
    const { publicKey } = useWallet();
    const { setVisible } = useWalletModal();

    useEffect(() => {
        if (connectWallet && !publicKey) {
            setVisible(true);
        }
    }, [connectWallet, publicKey, setVisible]);

    // TODO : Add translation
    const text = useMemo(() => {
        switch (status) {
            case PaymentStatus.Pending:
                return "Merci d'approuver la transaction !";
            case PaymentStatus.Sent:
                return 'Envoie de la transaction ...';
            case PaymentStatus.Confirmed:
                return 'Vérification en cours';
            default:
                return null;
        }
    }, [status]);

    return (
        <div className={css.root}>
            <div className={css.header}>
                <BackButton onClick={reset}>Annuler</BackButton>
                {connectWallet && IS_MERCHANT_POS ? <WalletMultiButton /> : null}
            </div>
            <div className={css.main}>
                <TransactionInfo />
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
                        {status !== PaymentStatus.Error ? <div className={css.confirm}>{text}</div> : <Error />}
                        <GenerateButton>Réessayer</GenerateButton>
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
