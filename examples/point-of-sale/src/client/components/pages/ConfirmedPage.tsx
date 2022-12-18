import { NextPage } from 'next';
import React from 'react';
import { FormattedMessage } from "react-intl";
import { usePayment } from '../../hooks/usePayment';
import { BackButton } from '../buttons/BackButton';
import { TransactionsLink } from '../buttons/TransactionsLink';
import { PoweredBy } from '../sections/PoweredBy';
import { Progress } from '../sections/Progress';
import { TransactionInfo } from '../sections/TransactionInfo';
import css from './ConfirmedPage.module.css';

const ConfirmedPage: NextPage = () => {
    const { reset } = usePayment();

    return (
        <div className={css.root}>
            <div className={css.header}>
                <BackButton onClick={reset}><FormattedMessage id="newPayment" /></BackButton>
                <TransactionsLink />
            </div>
            <div className={css.main}>
                <TransactionInfo />
                <Progress />
            </div>
            <div className={css.footer}>
                <PoweredBy />
            </div>
        </div>
    );
};

export default ConfirmedPage;
