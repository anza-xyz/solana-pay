import React, { FC } from 'react';
import { BackButton } from '../buttons/BackButton';
import { PoweredBy } from '../sections/PoweredBy';
import { Progress } from '../sections/Progress';
import { TransactionsLink } from '../buttons/TransactionsLink';
import { usePayment } from '../../hooks/usePayment';
import * as styles from './ConfirmedPage.module.css';

export const ConfirmedPage: FC = () => {
    const { reset } = usePayment();

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <BackButton onClick={reset}>Start Over</BackButton>
                <TransactionsLink />
            </div>
            <div className={styles.main}>
                <Progress />
            </div>
            <div className={styles.footer}>
                <PoweredBy />
            </div>
        </div>
    );
};
