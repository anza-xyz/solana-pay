import { PublicKey } from '@solana/web3.js';
import React, { FC, ReactElement, ReactNode } from 'react';
import { ConfigContext } from '../../hooks/useConfig';
import { Confirmations, Digits } from '../../types';

export interface ConfigProviderProps {
    children: ReactNode;
    recipient: PublicKey;
    label: string;
    splToken?: PublicKey;
    symbol: string;
    icon: ReactElement;
    decimals: Digits;
    minDecimals?: Digits;
    requiredConfirmations?: Confirmations;
    connectWallet?: boolean;
}

export const ConfigProvider: FC<ConfigProviderProps> = ({
    children,
    recipient,
    label,
    splToken,
    icon,
    symbol,
    decimals,
    minDecimals = 0,
    requiredConfirmations = 1,
    connectWallet = false,
}) => {
    return (
        <ConfigContext.Provider
            value={{
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
