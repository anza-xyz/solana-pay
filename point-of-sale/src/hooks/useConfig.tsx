import { PublicKey } from '@solana/web3.js';
import React, { createContext, FC, ReactNode, useContext } from 'react';
import { Digits } from '../types';

export interface ConfigContextState {
    account: PublicKey;
    token: PublicKey;
    symbol: string;
    decimals: Digits;
    label: string;
}

export const ConfigContext = createContext<ConfigContextState>({} as ConfigContextState);

export function useConfig(): ConfigContextState {
    return useContext(ConfigContext);
}

export interface ConfigProviderProps {
    children: ReactNode;
    account: PublicKey;
    token: PublicKey;
    symbol: string;
    decimals: Digits;
    label: string;
}

export const ConfigProvider: FC<ConfigProviderProps> = ({ children, account, token, symbol, decimals, label }) => {
    return (
        <ConfigContext.Provider value={{ account, token, symbol, decimals, label }}>{children}</ConfigContext.Provider>
    );
};
