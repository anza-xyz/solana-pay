import React, { FC, useCallback } from 'react';
import { ConnectIcon } from '../images/ConnectIcon';
import { DisconnectIcon } from '../images/DisconnectIcon';
import css from './ConnectionButton.module.css';
import { IS_MERCHANT_POS } from '../../utils/env';
import { useWallet } from "@solana/wallet-adapter-react";
import { SolflareWalletName } from "@solana/wallet-adapter-wallets";

export const ConnectionButton: FC = () => {
    const { wallet, connect, disconnect } = useWallet();

    const handleClick = useCallback(async () => {
        if (!wallet) {
            connect().catch(() => { });
        } else {
            disconnect().catch(() => { });
        }
    }, [wallet, connect, disconnect]);

    return !IS_MERCHANT_POS ? (
        <button className={css.button} type="button" onClick={handleClick}>
            {wallet ? <ConnectIcon /> : <DisconnectIcon />}
        </button>
    ) : null;
};