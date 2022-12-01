import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React, { FC, MouseEventHandler, ReactNode, useCallback, useMemo } from 'react';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import { IS_MERCHANT_POS } from "../../utils/env";
import css from './GenerateButton.module.css';
import { SolflareWalletName } from "@solana/wallet-adapter-wallets";
import { SolanaMobileWalletAdapterWalletName } from '@solana-mobile/wallet-adapter-mobile';

export interface GenerateButtonProps {
    children: ReactNode;
}

export const GenerateButton: FC<GenerateButtonProps> = ({ children }) => {
    const { amount, status, generate } = usePayment();
    const { wallet, select, publicKey, connect, connecting } = useWallet();

    const disabled = useMemo(() => {
        return publicKey !== null && (!amount || amount.isLessThanOrEqualTo(0) || (status !== PaymentStatus.New && status !== PaymentStatus.Error));
    }, [amount, status, publicKey]);

    const content = useMemo(() => {
        return publicKey || IS_MERCHANT_POS ? children : (connecting) ? "Connexion ..." : 'Se connecter';
    }, [children, publicKey, connecting]);

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        () => {
            if (publicKey || IS_MERCHANT_POS) {
                generate();
            } else {
                const a = () => { try { connect().catch(() => setTimeout(() => select(SolflareWalletName), 100)); } catch { } };
                if (!wallet) {
                    let isMobile = typeof window !== 'undefined' &&
                        window.isSecureContext &&
                        typeof document !== 'undefined' &&
                        /mobi|android/i.test(navigator.userAgent);

                    setTimeout(() => {
                        select(isMobile ? SolanaMobileWalletAdapterWalletName : SolflareWalletName);
                        a();
                    }, 100);
                } else {
                    a();
                }
            }
        }, [generate, publicKey, select, connect, wallet]);

    return (
        // <WalletMultiButton></WalletMultiButton>
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
