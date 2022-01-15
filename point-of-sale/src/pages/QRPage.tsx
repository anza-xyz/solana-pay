import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import React, { FC, useEffect } from 'react';
import { Amount } from '../components/Amount';
import { PoweredBy } from '../components/PoweredBy';
import { QRCode } from '../components/QRCode';
import { useConfig } from '../hooks/useConfig';
import { usePayment } from '../hooks/usePayment';
import * as styles from './QRPage.module.css';

export const QRPage: FC = () => {
    const { symbol } = useConfig();
    const { amount, reset } = usePayment();
    const { publicKey } = useWallet();
    const { setVisible } = useWalletModal();

    useEffect(() => {
        if (!publicKey) {
            setVisible(true);
        }
    }, [publicKey, setVisible]);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <button className={styles.button} type="button" onClick={reset}>
                    <span className={styles.arrow}>◄</span>Cancel Payment
                </button>
            </div>
            <div className={styles.main}>
                <div className={styles.amount}>
                    <Amount amount={amount} />
                </div>
                <div className={styles.symbol}>{symbol}</div>
                <div className={styles.code}>
                    <QRCode />
                </div>
                <div className={styles.scan}>Scan this code with your Solana Pay wallet</div>
                <div className={styles.confirm}>You'll be asked to confirm the transaction</div>
            </div>
            <div className={styles.footer}>
                <PoweredBy />
            </div>
        </div>
    );
};
