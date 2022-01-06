import { validateTransactionSignature } from '@solana/pay';
import React, { FC, useEffect, useState } from 'react';
import { PoweredBy } from '../components/PoweredBy';
import { QRCode } from '../components/QRCode';
import { useConfig } from '../hooks/useConfig';
import { useConnection } from '../hooks/useConnection';
import { usePayment } from '../hooks/usePayment';
import * as styles from './QRPage.module.css';

export const ConfirmationPage: FC = () => {
    const { account, token, symbol } = useConfig();
    const { amount, signature } = usePayment();
    const { connection } = useConnection();

    useEffect(() => {
        (async () => {
            if (signature && amount) {
                try {
                    await validateTransactionSignature(connection, signature, account, amount, token, 'confirmed');
                } catch (error: any) {
                    console.log(error);
                }
            }
        })();
    }, [signature, amount]);

    return (
        <div className={styles.root}>
            <div className={styles.header}>{'<'} Cancel Payment</div>
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
