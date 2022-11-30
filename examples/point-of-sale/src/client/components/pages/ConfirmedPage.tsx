import { NextPage } from 'next';
import React from 'react';
import { usePayment } from '../../hooks/usePayment';
import { BackButton } from '../buttons/BackButton';
import { TransactionsLink } from '../buttons/TransactionsLink';
import { PoweredBy } from '../sections/PoweredBy';
import { Progress } from '../sections/Progress';
import { TransactionInfo } from '../sections/TransactionInfo';
import css from './ConfirmedPage.module.css';

const ConfirmedPage: NextPage = () => {
    const { reset } = usePayment();

    // TODO : Add translation
    return (
        <div className={css.root}>
            <div className={css.header}>
                <BackButton onClick={reset}>Nouveau Paiement</BackButton>
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
