import React, { FC } from 'react';
import { PoweredBy } from '../components/PoweredBy';
import { Transactions } from '../components/Transactions';
import { usePayment } from '../hooks/usePayment';
import * as styles from './TransactionsPage.module.css';

export const TransactionsPage: FC = () => {
    const { reset } = usePayment();

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <button className={styles.button} type="button" onClick={reset}>
                    <span className={styles.arrow}>◄</span>Back
                </button>
            </div>
            <div className={styles.main}>
                <Transactions />
            </div>
            <div className={styles.footer}>
                <PoweredBy />
            </div>
        </div>
    );
};
