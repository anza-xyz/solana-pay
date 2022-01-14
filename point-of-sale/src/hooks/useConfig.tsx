import { PublicKey } from '@solana/web3.js';
import React, { createContext, FC, ReactNode, useContext } from 'react';
import { Digits } from '../types';

export interface ConfigContextState {
    recipient: PublicKey;
    label: string;
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
    recipient: PublicKey;
    label: string;
    token: PublicKey;
    symbol: string;
    decimals: Digits;
    minDecimals: Digits;
    requiredConfirmations: number;
}

export const ConfigProvider: FC<ConfigProviderProps> = ({
    children,
    recipient,
    label,
    token,
    symbol,
    decimals,
    minDecimals = 0,
    requiredConfirmations = 32,
}) => {
    return (
        <ConfigContext.Provider
            value={{ recipient, label, token, symbol, decimals, minDecimals, requiredConfirmations }}
        >
            {children}
        </ConfigContext.Provider>
    );
};
