import { PublicKey } from '@solana/web3.js';
import React, { FC, ReactElement, ReactNode } from 'react';
import { ConfigContext } from '../../hooks/useConfig';
import { Confirmations, Digits } from '../../types';
import { MAX_VALUE } from '../../utils/constants';

export interface ConfigProviderProps {
    children: ReactNode;
    link?: URL;
    recipient: PublicKey;
    label: string;
    message?: string;
    splToken?: PublicKey;
    symbol: string;
    icon: ReactElement;
    decimals: Digits;
    minDecimals?: Digits;
    maxValue: number;
    requiredConfirmations?: Confirmations;
    currency: string;
    id?: number;
    connectWallet?: boolean;
    reset?: () => void;
}

export const ConfigProvider: FC<ConfigProviderProps> = ({
    children,
    link,
    recipient,
    label,
    message,
    splToken,
    icon,
    symbol,
    decimals,
    minDecimals = 0,
    maxValue = MAX_VALUE,
    requiredConfirmations = 1,
    currency,
    id,
    connectWallet = false,
    reset,
}) => {
    return (
        <ConfigContext.Provider
            value={{
                link,
                recipient,
                label,
                message,
                splToken,
                symbol,
                icon,
                decimals,
                minDecimals,
                maxValue,
                requiredConfirmations,
                currency,
                id,
                connectWallet,
                reset
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
};
