import { useWallet } from "@solana/wallet-adapter-react";
import React, { FC, MouseEventHandler, ReactNode, useCallback, useMemo, useState } from 'react';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import { FAUCET } from "../../utils/constants";
import { IS_MERCHANT_POS } from "../../utils/env";
import css from './GenerateButton.module.css';

export interface GenerateButtonProps {
    children: ReactNode;
}

export const GenerateButton: FC<GenerateButtonProps> = ({ children }) => {
    const { amount, status, generate, balance, selectWallet } = usePayment();
    const { publicKey, connecting } = useWallet();

    const [needRefresh, setNeedRefresh] = useState(false);

    const hasInsufficientBalance = useMemo(() => balance && (balance <= 0 || (amount && balance < parseFloat(amount.toString()))), [balance, amount]);
    const disabled = useMemo(() => {
        return publicKey !== null && !balance && (!amount || amount.isLessThanOrEqualTo(0) || (status !== PaymentStatus.New && status !== PaymentStatus.Error));
    }, [amount, status, publicKey, balance]);

    const content = useMemo(() => {
        return !hasInsufficientBalance ? publicKey || IS_MERCHANT_POS ? children : connecting ? "Connexion ..." : 'Se connecter' : needRefresh ? "Recharger" : "S'approvisionner";
    }, [children, publicKey, connecting, hasInsufficientBalance, needRefresh]);

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        () => {
            if (!hasInsufficientBalance) {
                if (publicKey || IS_MERCHANT_POS) {
                    generate();
                } else if (!connecting) {
                    selectWallet();
                }
            } else {
                if (needRefresh) {
                    setNeedRefresh(false);
                    //TODO
                } else {
                    window.open(FAUCET, '_blank');
                    setNeedRefresh(true);
                }
            }
        }, [generate, publicKey, selectWallet, hasInsufficientBalance, connecting, needRefresh]);

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
