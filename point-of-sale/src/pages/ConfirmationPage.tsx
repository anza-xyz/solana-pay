import React, { FC, useMemo } from 'react';
import { PoweredBy } from '../components/PoweredBy';
import { PaymentStatus, usePayment } from '../hooks/usePayment';
import * as styles from './ConfirmationPage.module.css';

export const ConfirmationPage: FC = () => {
    const { status, confirmations, reset } = usePayment();

    const text = useMemo(() => {
        if (status === PaymentStatus.Finalized) return PaymentStatus.Finalized;
        return `${status} (${confirmations} / 32 confirmations)`;
    }, [status, confirmations]);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <button className={styles.button} type="button" onClick={reset}>
                    <span className={styles.arrow}>◄</span>Start Over
                </button>
            </div>
            <div className={styles.main}>{text}</div>
            <div className={styles.footer}>
                <PoweredBy />
            </div>
        </div>
    );
};
