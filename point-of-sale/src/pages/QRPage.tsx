import { findTransactionSignature, FindTransactionSignatureError } from '@solana/pay';
import { ConfirmedSignatureInfo } from '@solana/web3.js';
import React, { FC, useCallback, useEffect } from 'react';
import { PoweredBy } from '../components/PoweredBy';
import { QRCode } from '../components/QRCode';
import { useConfig } from '../hooks/useConfig';
import { useConnection } from '../hooks/useConnection';
import { usePayment } from '../hooks/usePayment';
import * as styles from './QRPage.module.css';

export const QRPage: FC = () => {
    const { symbol } = useConfig();
    const { amount, reference, setReference, setSignature } = usePayment();
    const { connection } = useConnection();

    useEffect(() => {
        if (reference) {
            const interval = setInterval(async () => {
                let signature: ConfirmedSignatureInfo;
                try {
                    signature = await findTransactionSignature(connection, reference);
                } catch (error: any) {
                    if (!(error instanceof FindTransactionSignatureError)) {
                        console.error(error);
                    }
                    return;
                }

                clearInterval(interval);
                setSignature(signature.signature);
            }, 500);

            return () => clearInterval(interval);
        }
    }, [reference]);

    const onClick = useCallback(() => setReference(undefined), [setReference]);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <button className={styles.button} type="button" onClick={onClick}>
                    <span className={styles.arrow}>◄</span>Cancel Payment
                </button>
            </div>
            <div className={styles.main}>
                <div className={styles.amount}>{String(amount)}</div>
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
