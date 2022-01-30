import React, { FC } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useConfig } from '../../hooks/useConfig';
import { usePayment } from '../../hooks/usePayment';
import { Amount } from './Amount';
import * as styles from './Summary.module.pcss';

export const Summary: FC = () => {
    const { symbol } = useConfig();
    const { amount } = usePayment();
    const phone = useMediaQuery({ query: '(max-width: 767px)' });

    return phone ? null : (
        <div className={styles.root}>
            <div className={styles.title}>Balance Due</div>
            <div className={styles.total}>
                <div className={styles.totalLeft}>Total</div>
                <div className={styles.totalRight}>
                    <div className={styles.symbol}>{symbol}</div>
                    <div className={styles.amount}>
                        <Amount amount={amount} />
                    </div>
                </div>
            </div>
        </div>
    );
};
