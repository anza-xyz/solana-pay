import { useWallet } from "@solana/wallet-adapter-react";
import React, { FC, MouseEventHandler, ReactNode, useCallback, useMemo } from 'react';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import { IS_MERCHANT_POS } from "../../utils/env";
import css from './GenerateButton.module.css';

export interface GenerateButtonProps {
    children: ReactNode;
}

export const GenerateButton: FC<GenerateButtonProps> = ({ children }) => {
    const { amount, status, generate } = usePayment();
    const { publicKey, connect } = useWallet();

    const disabled = useMemo(() => {
        return publicKey !== null && (!amount || amount.isLessThanOrEqualTo(0) || (status !== PaymentStatus.New && status !== PaymentStatus.Error));
    }, [amount, status, publicKey]);

    const content = useMemo(() => {
        return publicKey || IS_MERCHANT_POS ? children : 'Se connecter';
    }, [children, publicKey]);

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        () => {
            if (publicKey || IS_MERCHANT_POS) {
                generate();
            } else {
                connect().catch(() => { });
            }
        },
        [generate, connect, publicKey]
    );


    return (
        <button
            className={css.root}
            type="button"
            onClick={handleClick}
            disabled={disabled}
        >
            {content}
        </button>
    );
};
