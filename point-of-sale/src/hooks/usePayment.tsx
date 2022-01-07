import { findTransactionSignature, FindTransactionSignatureError, validateTransactionSignature } from '@solana/pay';
import { ConfirmedSignatureInfo, Keypair, PublicKey, SignatureStatus, TransactionSignature } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import React, { createContext, FC, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useConfig } from './useConfig';
import { useConnection } from './useConnection';

export enum PaymentStatus {
    New,
    Waiting,
    Confirmed,
    Finalized,
    Valid,
    Invalid,
}

export interface PaymentContextState {
    amount: BigNumber | undefined;
    setAmount(amount: BigNumber | undefined): void;
    message: string | undefined;
    setMessage(message: string | undefined): void;
    memo: string | undefined;
    setMemo(memo: string | undefined): void;
    reference: PublicKey | undefined;
    signature: TransactionSignature | undefined;
    status: PaymentStatus;
    confirmations: number;
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
    const [status, setStatus] = useState(PaymentStatus.Confirmed);
    const [confirmations, setConfirmations] = useState(0);

    const reset = useCallback(() => {
        setAmount(undefined);
        setMessage(undefined);
        setMemo(undefined);
        setReference(undefined);
        setSignature(undefined);
        setStatus(PaymentStatus.New);
        setConfirmations(0);
    }, []);

    const generate = useCallback(() => {
        setReference(Keypair.generate().publicKey);
        setStatus(PaymentStatus.Waiting);
    }, []);

    // When the status is waiting, poll for the transaction using the reference key
    useEffect(() => {
        if (status === PaymentStatus.Waiting && reference && !signature) {
            let changed = false;

            const interval = setInterval(async () => {
                let signature: ConfirmedSignatureInfo;
                try {
                    signature = await findTransactionSignature(connection, reference, undefined, 'confirmed');
                } catch (error: any) {
                    if (!(error instanceof FindTransactionSignatureError)) {
                        console.error(error);
                    }
                    return;
                }

                if (!changed) {
                    clearInterval(interval);
                    setSignature(signature.signature);
                    setStatus(PaymentStatus.Confirmed);
                }
            }, 250);

            return () => {
                changed = true;
                clearInterval(interval);
            };
        }
    }, [status, reference, signature]);

    // When the status is confirmed, validate the transaction
    useEffect(() => {
        if (status === PaymentStatus.Confirmed && signature && amount) {
            let changed = false;

            (async () => {
                try {
                    await validateTransactionSignature(connection, signature, account, amount, token, 'confirmed');

                    if (!changed) {
                        setStatus(PaymentStatus.Valid);
                    }
                } catch (error: any) {
                    console.log(error);
                    setStatus(PaymentStatus.Invalid);
                }
            })();

            return () => {
                changed = true;
            };
        }
    }, [status, signature, amount]);

    // When the status is valid, wait for the transaction to finalize
    useEffect(() => {
        if (status === PaymentStatus.Valid && signature) {
            let changed = false;

            const interval = setInterval(async () => {
                let status: SignatureStatus;
                try {
                    const response = await connection.getSignatureStatus(signature);
                    const value = response.value;
                    if (!value) return;
                    if (value.err) throw value.err;
                    status = value;
                } catch (error: any) {
                    console.log(error);
                    return;
                }

                if (!changed) {
                    setConfirmations(status.confirmations || 0);

                    if (status.confirmationStatus === 'finalized') {
                        clearInterval(interval);
                        setStatus(PaymentStatus.Finalized);
                    }
                }
            }, 250);

            return () => {
                changed = true;
                clearInterval(interval);
            };
        }
    }, [status, signature]);

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
                status,
                confirmations,
                reset,
                generate,
            }}
        >
            {children}
        </PaymentContext.Provider>
    );
};
