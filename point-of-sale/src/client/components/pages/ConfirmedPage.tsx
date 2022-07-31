import { NextPage } from 'next';
import React from 'react';
import { useConfig } from '../../hooks/useConfig';
import { usePayment } from '../../hooks/usePayment';
import { SHOW_SYMBOL } from '../../utils/env';
import { BackButton } from '../buttons/BackButton';
import { TransactionsLink } from '../buttons/TransactionsLink';
import { Amount } from '../sections/Amount';
import { PoweredBy } from '../sections/PoweredBy';
import { Progress } from '../sections/Progress';
import css from './ConfirmedPage.module.css';

const ConfirmedPage: NextPage = () => {
    const { reset } = usePayment();
    const { symbol, currency, label } = useConfig();
    const { amount } = usePayment();

    // TODO : Add translation
    return (
        <div className={css.root}>
            <div className={css.header}>
                <BackButton onClick={reset}>Recommencer</BackButton>
                <TransactionsLink />
            </div>
            <div className={css.main}>
                <div className={css.symbol}>{label}</div>
                <div className={css.amount}>
                    {SHOW_SYMBOL ? symbol : null}
                    <Amount amount={amount} />
                </div>
                {!SHOW_SYMBOL ? <div className={css.symbol}>{currency}</div> : null}

                <Progress />
            </div>
            <div className={css.footer}>
                <PoweredBy />
            </div>
        </div>
    );
};

export default ConfirmedPage;
