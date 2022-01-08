import React, { FC } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { PoweredBy } from '../components/PoweredBy';
import { Progress } from '../components/Progress';
import { usePayment } from '../hooks/usePayment';
import * as styles from './ConfirmationPage.module.css';

export const ConfirmationPage: FC = () => {
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
