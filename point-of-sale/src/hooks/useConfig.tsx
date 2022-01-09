import { PublicKey } from '@solana/web3.js';
import React, { createContext, FC, ReactNode, useContext } from 'react';
import { Digits } from '../types';

export interface ConfigContextState {
    label: string;
    account: PublicKey;
    token: PublicKey;
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
    label: string;
    account: PublicKey;
    token: PublicKey;
    symbol: string;
    decimals: Digits;
    minDecimals: Digits;
    requiredConfirmations: number;
}

export const ConfigProvider: FC<ConfigProviderProps> = ({
    children,
    label,
    account,
    token,
    symbol,
    decimals,
    minDecimals = 0,
    requiredConfirmations = 32,
}) => {
    return (
        <ConfigContext.Provider value={{ label, account, token, symbol, decimals, minDecimals, requiredConfirmations }}>
            {children}
        </ConfigContext.Provider>
    );
};
