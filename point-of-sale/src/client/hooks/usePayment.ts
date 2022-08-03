import { PublicKey, TransactionSignature } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { createContext, useContext } from 'react';
import { Confirmations } from '../types';

// TODO : Add translation
export enum PaymentStatus {
    New = 'Nouveau',
    Pending = 'En cours',
    Sent = 'Envoyé',
    Confirmed = 'Confirmé',
    Valid = 'Valide',
    Invalid = 'Invalide',
    Finalized = 'Terminé',
}

export interface PaymentContextState {
    amount: BigNumber | undefined;
    setAmount(amount: BigNumber | undefined): void;
    memo: string | undefined;
    setMemo(memo: string | undefined): void;
    reference: PublicKey | undefined;
    signature: TransactionSignature | undefined;
    status: PaymentStatus;
    confirmations: Confirmations;
    progress: number;
    url: URL;
    error?: string;
    reset(): void;
    generate(): void;
}

export const PaymentContext = createContext<PaymentContextState>({} as PaymentContextState);

export function usePayment(): PaymentContextState {
    return useContext(PaymentContext);
}
