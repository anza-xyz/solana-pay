import React, { FC } from 'react';
import { usePayment } from '../hooks/usePayment';
import * as styles from './Generate.module.css';

export const Generate: FC = () => {
    const { amount, generate } = usePayment();

    return (
        <button
            className={styles.root}
            type="button"
            onClick={generate}
            disabled={!amount || amount.isLessThanOrEqualTo(0)}
        >
            Generate Payment Code
        </button>
    );
};
