import React, { FC } from 'react';
import { Amount } from '../components/Amount';
import { NumPad } from '../components/NumPad';
import { PoweredBy } from '../components/PoweredBy';
import { useConfig } from '../hooks/useConfig';
import { usePayment } from '../hooks/usePayment';
import * as styles from './AmountPage.module.css';

export const AmountPage: FC = () => {
    const { symbol } = useConfig();
    const { amount, generate } = usePayment();

    return (
        <div className={styles.root}>
            <div className={styles.entry}>
                <NumPad />
            </div>
            <div className={styles.summary}>
                <div className={styles.header}>
                    <div className={styles.title}>Balance Due</div>
                    <div className={styles.total}>
                        <div className={styles.totalLeft}>Total</div>
                        <div className={styles.totalRight}>
                            <div className={styles.symbol}>{symbol}</div>
                            <div className={styles.amount}>
                                <Amount />
                            </div>
                        </div>
                    </div>
                    <button
                        className={styles.button}
                        type="button"
                        onClick={generate}
                        disabled={!amount || amount.isLessThanOrEqualTo(0)}
                    >
                        Generate Payment Code
                    </button>
                </div>
                <div className={styles.footer}>
                    <PoweredBy />
                </div>
            </div>
        </div>
    );
};
