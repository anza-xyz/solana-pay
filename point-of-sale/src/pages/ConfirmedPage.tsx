import React, { FC } from 'react';
import { PoweredBy } from '../components/PoweredBy';
import { Progress } from '../components/Progress';
import { usePayment } from '../hooks/usePayment';
import * as styles from './ConfirmedPage.module.css';

export const ConfirmedPage: FC = () => {
    const { reset } = usePayment();

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <button className={styles.button} type="button" onClick={reset}>
                    <span className={styles.arrow}>◄</span>Start Over
                </button>
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
