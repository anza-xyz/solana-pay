import React, { FC, useCallback } from 'react';
import { ConnectIcon } from '../images/ConnectIcon';
import { DisconnectIcon } from '../images/DisconnectIcon';
import css from './ConnectionButton.module.css';
import { IS_MERCHANT_POS } from '../../utils/env';
import { useWallet } from "@solana/wallet-adapter-react";
import { SolflareWalletName } from "@solana/wallet-adapter-wallets";
import { SolanaMobileWalletAdapterWalletName } from '@solana-mobile/wallet-adapter-mobile';

export const ConnectionButton: FC = () => {
    const { wallet, publicKey, connect, disconnect, connected, select } = useWallet();

    const handleClick = useCallback(async () => {
        if (!publicKey) {
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
        } else {
            disconnect().catch(() => { });
        }
    }, [wallet, publicKey, connect, disconnect, select]);

    return !IS_MERCHANT_POS ? (
        <button className={css.button} type="button" onClick={handleClick}>
            {connected ? <ConnectIcon /> : <DisconnectIcon />}
        </button>
    ) : null;
};
