import { useWallet } from "@solana/wallet-adapter-react";
import React, { FC, MouseEventHandler, ReactNode, useCallback, useMemo } from 'react';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import css from './GenerateButton.module.css';

export interface GenerateButtonProps {
    children: ReactNode;
}

export const GenerateButton: FC<GenerateButtonProps> = ({ children }) => {
    const { amount, status, generate } = usePayment();
    const { publicKey } = useWallet();

    return (
        <button
            className={css.root}
            type="button"
            onClick={generate}
            disabled={!publicKey || !amount || amount.isLessThanOrEqualTo(0) || (status !== PaymentStatus.New && status !== PaymentStatus.Error)}
        >
            {children}
        </button>
    );
};
