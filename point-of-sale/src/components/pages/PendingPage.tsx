import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { FC, useEffect } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { usePayment } from '../../hooks/usePayment';
import { BackButton } from '../buttons/BackButton';
import { Amount } from '../sections/Amount';
import { PoweredBy } from '../sections/PoweredBy';
import { QRCode } from '../sections/QRCode';
import * as styles from './PendingPage.module.pcss';

export const PendingPage: FC = () => {
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
                <BackButton onClick={reset}>Cancel Payment</BackButton>
                <WalletMultiButton />
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
