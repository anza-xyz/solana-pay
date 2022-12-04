import React, { FC, useCallback } from 'react';
import { ConnectIcon } from '../images/ConnectIcon';
import { DisconnectIcon } from '../images/DisconnectIcon';
import css from './ConnectionButton.module.css';
import { IS_MERCHANT_POS } from '../../utils/env';
import { useWallet } from "@solana/wallet-adapter-react";
import { usePayment } from "../../hooks/usePayment";

export const ConnectionButton: FC = () => {
    const { publicKey, disconnect, connected } = useWallet();
    const { selectWallet } = usePayment();

    const handleClick = useCallback(async () => {
        if (!publicKey) {
            selectWallet();
        } else {
            disconnect().catch(() => { });
        }
    }, [disconnect, publicKey, selectWallet]);

    return !IS_MERCHANT_POS ? (
        <button className={css.button} type="button" onClick={handleClick}>
            {connected ? <ConnectIcon /> : <DisconnectIcon />}
        </button>
    ) : null;
};
