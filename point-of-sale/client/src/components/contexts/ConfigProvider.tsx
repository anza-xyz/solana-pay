import { PublicKey } from '@solana/web3.js';
import React, { FC, ReactElement, ReactNode } from 'react';
import { ConfigContext } from '../../hooks/useConfig';
import { Digits } from '../../types';
import { MAX_CONFIRMATIONS } from '../../utils/constants';

export interface ConfigProviderProps {
    children: ReactNode;
    link?: URL;
    recipient: PublicKey;
    label: string;
    splToken?: PublicKey;
    symbol: string;
    icon: ReactElement;
    decimals: Digits;
    minDecimals?: Digits;
    requiredConfirmations?: number;
    connectWallet?: boolean;
}

export const ConfigProvider: FC<ConfigProviderProps> = ({
    children,
    link,
    recipient,
    label,
    splToken,
    icon,
    symbol,
    decimals,
    minDecimals = 0,
    requiredConfirmations = MAX_CONFIRMATIONS,
    connectWallet = false,
}) => {
    return (
        <ConfigContext.Provider
            value={{
                link,
                recipient,
                label,
                splToken,
                symbol,
                icon,
                decimals,
                minDecimals,
                requiredConfirmations,
                connectWallet,
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
};
