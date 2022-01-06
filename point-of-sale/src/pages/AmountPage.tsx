import { Keypair } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useMemo } from 'react';
import { NumPad } from '../components/NumPad';
import { useConfig } from '../hooks/useConfig';
import { usePayment } from '../hooks/usePayment';
import * as styles from './AmountPage.module.css';

const ZERO = new BigNumber(0);

export const AmountPage: FC = () => {
    const { symbol } = useConfig();
    const { amount, setReference } = usePayment();

    const onClick = useCallback(() => setReference(Keypair.generate().publicKey), [setReference]);
    const amountOrZero = useMemo(() => (!amount || amount.isNaN() || amount.isZero() ? ZERO : amount), [amount]);

    return (
        <div className={styles.root}>
            <div className={styles.entry}>
                <NumPad />
            </div>
            <div className={styles.summary}>
                <div className={styles.title}>Balance Due</div>
                <div className={styles.total}>
                    <div className={styles.totalLeft}>Total</div>
                    <div className={styles.totalRight}>
                        <div className={styles.symbol}>{symbol}</div>
                        <div className={styles.amount}>{String(amountOrZero)}</div>
                    </div>
                </div>
                <div className={styles.middle}>
                    <button className={styles.button} type="button" onClick={onClick} disabled={amountOrZero.isZero()}>
                        Generate Payment Code
                    </button>
                </div>
                <div className={styles.footer}>Powered by SolanaPay</div>
            </div>
        </div>
    );
};
