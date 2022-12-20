import { NextPage } from 'next';
import React, { useMemo } from 'react';
import { FormattedMessage } from "react-intl";
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import { IS_CUSTOMER_POS } from '../../utils/env';
import { BackButton } from '../buttons/BackButton';
import { GenerateButton } from '../buttons/GenerateButton';
import { Error } from '../sections/Error';
import { PoweredBy } from '../sections/PoweredBy';
import { QRCode } from '../sections/QRCode';
import { TransactionInfo } from '../sections/TransactionInfo';
import css from './PendingPage.module.css';

const PendingPage: NextPage = () => {
    const { reset, status } = usePayment();

    const id = useMemo(() => {
        switch (status) {
            case PaymentStatus.Pending:
                return "createTransaction";
            case PaymentStatus.Creating:
                return "approveTransaction";
            case PaymentStatus.Sent:
                return "sendTransaction";
            case PaymentStatus.Confirmed:
                return "verifyTransaction";
            default:
                return null;
        }
    }, [status]);

    return (
        <div className={css.root}>
            <div className={css.header}>
                <BackButton onClick={reset}><FormattedMessage id="cancel" /></BackButton>
            </div>
            <div className={css.main}>
                <TransactionInfo />
                {!IS_CUSTOMER_POS ? id ? (
                    <div>
                        <div className={css.code}>
                            <QRCode />
                        </div>
                        <div className={css.scan}><FormattedMessage id="scanCode" /></div>
                        <div className={css.confirm}><FormattedMessage id="approveTransaction" /></div>
                    </div>
                ) : null : (
                    <div>
                        <div className={css.scan}></div>
                        {status !== PaymentStatus.Error ? (
                            <div className={css.confirm}>{id ? <FormattedMessage id={id} /> : null}</div>
                        ) : (
                            <div>
                                <Error />
                                <GenerateButton id="retry" />
                            </div>
                        )}
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
