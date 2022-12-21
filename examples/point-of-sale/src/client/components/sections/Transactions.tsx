import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import React, { FC, useMemo } from 'react';
import { FormattedMessage, FormattedRelativeTime } from "react-intl";
import { useConfig } from '../../hooks/useConfig';
import { Transaction, useTransactions } from '../../hooks/useTransactions';
import { Amount } from './Amount';
import css from './Transactions.module.css';

export const Transactions: FC = () => {
    const { transactions } = useTransactions();

    return (
        <div className={css.root}>
            <div className={css.title}><FormattedMessage id="recentTransactions" /></div>
            {transactions.map((transaction) => (
                <Transaction key={transaction.signature} transaction={transaction} />
            ))}
        </div>
    );
};

const Transaction: FC<{ transaction: Transaction; }> = ({ transaction }) => {
    const { icon } = useConfig();

    const amount = useMemo(() => new BigNumber(transaction.amount), [transaction.amount]);
    const signature = useMemo(
        () => transaction.signature.slice(0, 8) + '....' + transaction.signature.slice(-8),
        [transaction.signature]
    );

    return (
        <div className={css.transaction}>
            <div className={css.icon}>{icon}</div>
            <div className={css.left}>
                <div className={css.amount}>
                    <Amount value={amount} showZero />
                </div>
                <div className={css.signature}>{signature}</div>
            </div>
            <div className={css.right}>
                <div className={css.time}><FormattedRelativeTime value={transaction.timestamp - Date.now() / 1000} updateIntervalInSeconds={1} /></div>
                <div className={clsx(css.status, css[`status-${transaction.status}`])}><FormattedMessage id={transaction.status} /></div>
            </div>
        </div>
    );
};
