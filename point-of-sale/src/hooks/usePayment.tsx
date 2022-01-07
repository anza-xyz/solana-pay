import { findTransactionSignature, FindTransactionSignatureError, validateTransactionSignature } from '@solana/pay';
import { ConfirmedSignatureInfo, Keypair, PublicKey, TransactionSignature } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import React, { createContext, FC, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useConfig } from './useConfig';
import { useConnection } from './useConnection';

export interface PaymentContextState {
    amount: BigNumber | undefined;
    setAmount(amount: BigNumber | undefined): void;
    message: string | undefined;
    setMessage(message: string | undefined): void;
    memo: string | undefined;
    setMemo(memo: string | undefined): void;
    reference: PublicKey | undefined;
    signature: TransactionSignature | undefined;
    confirmed: boolean;
    reset(): void;
    generate(): void;
}

export const PaymentContext = createContext<PaymentContextState>({} as PaymentContextState);

export function usePayment(): PaymentContextState {
    return useContext(PaymentContext);
}

export interface PaymentProviderProps {
    children: ReactNode;
}

export const PaymentProvider: FC<PaymentProviderProps> = ({ children }) => {
    const { connection } = useConnection();
    const { account, token } = useConfig();

    const [amount, setAmount] = useState<BigNumber>();
    const [message, setMessage] = useState<string>();
    const [memo, setMemo] = useState<string>();
    const [reference, setReference] = useState<PublicKey>();
    const [signature, setSignature] = useState<TransactionSignature>();
    const [confirmed, setConfirmed] = useState(false);

    const reset = useCallback(() => {
        setAmount(undefined);
        setMessage(undefined);
        setMemo(undefined);
        setReference(undefined);
        setSignature(undefined);
        setConfirmed(false);
    }, [setAmount, setMessage, setMemo, setReference, setSignature, setConfirmed]);

    const generate = useCallback(() => setReference(Keypair.generate().publicKey), [setReference]);

    // useEffect(() => {
    //     if (reference) {
    //         const timeout = setTimeout(() => setSignature('x'), 3000);
    //         return () => clearTimeout(timeout);
    //     }
    // }, [reference]);
    //
    // useEffect(() => {
    //     if (reference && !signature) {
    //         const interval = setInterval(async () => {
    //             let signature: ConfirmedSignatureInfo;
    //             try {
    //                 signature = await findTransactionSignature(connection, reference);
    //             } catch (error: any) {
    //                 if (!(error instanceof FindTransactionSignatureError)) {
    //                     console.error(error);
    //                 }
    //                 return;
    //             }
    //
    //             clearInterval(interval);
    //             setSignature(signature.signature);
    //         }, 250);
    //
    //         return () => clearInterval(interval);
    //     }
    // }, [reference, signature]);
    //
    // useEffect(() => {
    //     if (signature) {
    //         const timeout = setTimeout(() => setConfirmed(true), 3000);
    //         return () => clearTimeout(timeout);
    //     }
    // }, [signature]);
    //
    // useEffect(() => {
    //     (async () => {
    //         if (signature && amount) {
    //             let changed = false;
    //             try {
    //                 await validateTransactionSignature(connection, signature, account, amount, token, 'confirmed');
    //
    //                 if (!changed) {
    //                     setConfirmed(true);
    //                 }
    //             } catch (error: any) {
    //                 console.log(error);
    //             }
    //
    //             return () => {
    //                 changed = true;
    //             };
    //         }
    //     })();
    // }, [signature, amount]);

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
                signature,
                confirmed,
                reset,
                generate,
            }}
        >
            {children}
        </PaymentContext.Provider>
    );
};
