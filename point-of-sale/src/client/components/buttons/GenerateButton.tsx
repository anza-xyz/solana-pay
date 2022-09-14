import React, { FC, ReactNode } from 'react';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import css from './GenerateButton.module.css';

export interface GenerateButtonProps {
    children: ReactNode;
}

export const GenerateButton: FC<GenerateButtonProps> = ({ children }) => {
    const { amount, status, generate } = usePayment();

    return (
        <button
            className={css.root}
            type="button"
            onClick={generate}
            disabled={!amount || amount.isLessThanOrEqualTo(0) || (status !== PaymentStatus.New && status !== PaymentStatus.Error)}
        >
            {children}
        </button>
    );
};
