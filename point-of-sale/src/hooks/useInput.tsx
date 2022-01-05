import BigNumber from 'bignumber.js';
import React, { createContext, FC, ReactNode, useContext, useState } from 'react';

export interface InputContextState {
    amount: BigNumber | undefined;
    setAmount(amount: BigNumber | undefined): void;
    message: string | undefined;
    setMessage(message: string | undefined): void;
    memo: string | undefined;
    setMemo(memo: string | undefined): void;
}

export const InputContext = createContext<InputContextState>({} as InputContextState);

export function useInput(): InputContextState {
    return useContext(InputContext);
}

export interface InputProviderProps {
    children: ReactNode;
}

export const InputProvider: FC<InputProviderProps> = ({ children }) => {
    const [amount, setAmount] = useState<BigNumber>();
    const [message, setMessage] = useState<string>();
    const [memo, setMemo] = useState<string>();

    return (
        <InputContext.Provider value={{ amount, setAmount, message, setMessage, memo, setMemo }}>
            {children}
        </InputContext.Provider>
    );
};
