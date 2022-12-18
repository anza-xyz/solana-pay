import { PublicKey, TransactionSignature } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { createContext, useContext } from 'react';
import { Confirmations } from '../types';

export enum PaymentStatus {
    New = 'New',
    Pending = 'Pending',
    Creating = 'Creating',
    Sent = 'Sent',
    Confirmed = 'Confirmed',
    Valid = 'Valid',
    Invalid = 'Invalid',
    Finalized = 'Finalized',
    Error = 'Error',
}

export interface PaymentContextState {
    amount: BigNumber | undefined;
    setAmount(amount: BigNumber | undefined): void;
    memo: string | undefined;
    setMemo(memo: string | undefined): void;
    balance?: number;
    reference: PublicKey | undefined;
    signature: TransactionSignature | undefined;
    status: PaymentStatus;
    confirmations: Confirmations;
    progress: number;
    url: URL;
    reset(): void;
    generate(): void;
    selectWallet(): void;
}

export const PaymentContext = createContext<PaymentContextState>({} as PaymentContextState);

export function usePayment(): PaymentContextState {
    return useContext(PaymentContext);
}
