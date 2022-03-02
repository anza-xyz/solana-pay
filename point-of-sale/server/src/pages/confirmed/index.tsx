import React, { FC } from 'react';
import { usePayment } from '../../hooks/usePayment';
import { BackButton } from '../../components/buttons/BackButton';
import { TransactionsLink } from '../../components/buttons/TransactionsLink';
import { PoweredBy } from '../../components/sections/PoweredBy';
import { Progress } from '../../components/sections/Progress';
import css from './confirmed.module.css';

export default function ConfirmedRoute() {
    const { reset } = usePayment();

    return (
        <div className={css.root}>
            <div className={css.header}>
                <BackButton onClick={reset}>Start Over</BackButton>
                <TransactionsLink />
            </div>
            <div className={css.main}>
                <Progress />
            </div>
            <div className={css.footer}>
                <PoweredBy />
            </div>
        </div>
    );
};
