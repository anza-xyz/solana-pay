import React, { FC } from 'react';
import { Amount } from '../components/Amount';
import { PoweredBy } from '../components/PoweredBy';
import { QRCode } from '../components/QRCode';
import { useConfig } from '../hooks/useConfig';
import { usePayment } from '../hooks/usePayment';
import * as styles from './QRPage.module.css';

export const QRPage: FC = () => {
    const { symbol } = useConfig();
    const { reset } = usePayment();

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <button className={styles.button} type="button" onClick={reset}>
                    <span className={styles.arrow}>◄</span>Cancel Payment
                </button>
            </div>
            <div className={styles.main}>
                <div className={styles.amount}>
                    <Amount />
                </div>
                <div className={styles.symbol}>{symbol}</div>
                <div className={styles.code}>
                    <QRCode />
                </div>
                <div className={styles.scan}>Scan this code with your SolanaPay wallet</div>
                <div className={styles.confirm}>You'll be asked to confirm the transaction</div>
            </div>
            <div className={styles.footer}>
                <PoweredBy />
            </div>
        </div>
    );
};
