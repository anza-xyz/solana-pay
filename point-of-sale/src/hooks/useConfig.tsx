import { PublicKey } from '@solana/web3.js';
import React, { createContext, FC, ReactElement, ReactNode, useContext } from 'react';
import { Digits } from '../types';
import { MAX_CONFIRMATIONS } from '../utils/constants';

export interface ConfigContextState {
    recipient: PublicKey;
    label: string;
    splToken: PublicKey | undefined;
    icon: ReactElement;
    symbol: string;
    decimals: Digits;
    minDecimals: Digits;
    requiredConfirmations: number;
}

export const ConfigContext = createContext<ConfigContextState>({} as ConfigContextState);

export function useConfig(): ConfigContextState {
    return useContext(ConfigContext);
}

export interface ConfigProviderProps {
    children: ReactNode;
    recipient: PublicKey;
    label: string;
    splToken?: PublicKey;
    icon: ReactElement;
    symbol: string;
    decimals: Digits;
    minDecimals: Digits;
    requiredConfirmations: number;
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
    requiredConfirmations = MAX_CONFIRMATIONS,
}) => {
    return (
        <ConfigContext.Provider
            value={{ recipient, label, splToken, icon, symbol, decimals, minDecimals, requiredConfirmations }}
        >
            {children}
        </ConfigContext.Provider>
    );
};
