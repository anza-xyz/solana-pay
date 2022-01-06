import { PublicKey, TransactionSignature } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import React, { createContext, FC, ReactNode, useContext, useState } from 'react';

export interface PaymentContextState {
    amount: BigNumber | undefined;
    setAmount(amount: BigNumber | undefined): void;
    message: string | undefined;
    setMessage(message: string | undefined): void;
    memo: string | undefined;
    setMemo(memo: string | undefined): void;
    reference: PublicKey | undefined;
    setReference(reference: PublicKey | undefined): void;
    signature: TransactionSignature | undefined;
    setSignature(signature: TransactionSignature | undefined): void;
    confirmed: boolean;
    setConfirmed(confirmed: boolean): void;
}

export const PaymentContext = createContext<PaymentContextState>({} as PaymentContextState);

export function usePayment(): PaymentContextState {
    return useContext(PaymentContext);
}

export interface PaymentProviderProps {
    children: ReactNode;
}

export const PaymentProvider: FC<PaymentProviderProps> = ({ children }) => {
    const [amount, setAmount] = useState<BigNumber>();
    const [message, setMessage] = useState<string>();
    const [memo, setMemo] = useState<string>();
    const [reference, setReference] = useState<PublicKey>();
    const [signature, setSignature] = useState<TransactionSignature>();
    const [confirmed, setConfirmed] = useState(false);

    return (
        <PaymentContext.Provider
            value={{
                amount,
                setAmount,
                message,
                setMessage,
                memo,
                setMemo,
                reference,
                setReference,
                signature,
                setSignature,
                confirmed,
                setConfirmed,
            }}
        >
            {children}
        </PaymentContext.Provider>
    );
};
