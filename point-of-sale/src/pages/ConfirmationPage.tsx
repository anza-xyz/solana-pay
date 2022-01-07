import React, { FC } from 'react';
import { PoweredBy } from '../components/PoweredBy';
import { QRCode } from '../components/QRCode';
import { useConfig } from '../hooks/useConfig';
import { usePayment } from '../hooks/usePayment';
import * as styles from './QRPage.module.css';

export const ConfirmationPage: FC = () => {
    const { symbol } = useConfig();
    const { amount, reset } = usePayment();

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <button className={styles.button} type="button" onClick={reset}>
                    <span className={styles.arrow}>◄</span>Start Over
                </button>
            </div>
            <div className={styles.main}>
                Total
                <br />
                {String(amount)}
                <br />
                {symbol}
                <br />
                <QRCode />
            </div>
            <div className={styles.footer}>
                <PoweredBy />
            </div>
        </div>
    );
};
