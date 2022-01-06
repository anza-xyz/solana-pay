import { Connection } from '@solana/web3.js';
import React, { createContext, FC, ReactNode, useContext, useMemo } from 'react';

export interface ConnectionContextState {
    connection: Connection;
}

export const ConnectionContext = createContext<ConnectionContextState>({} as ConnectionContextState);

export function useConnection(): ConnectionContextState {
    return useContext(ConnectionContext);
}

export interface ConnectionProviderProps {
    children: ReactNode;
}

export const ConnectionProvider: FC<ConnectionProviderProps> = ({ children }) => {
    const connection = useMemo(
        () => new Connection('https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/', 'confirmed'),
        []
    );

    return <ConnectionContext.Provider value={{ connection }}>{children}</ConnectionContext.Provider>;
};
