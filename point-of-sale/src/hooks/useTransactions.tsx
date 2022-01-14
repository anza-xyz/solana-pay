import { getAssociatedTokenAddress } from '@solana/spl-token';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, TransactionConfirmationStatus, TransactionError, TransactionSignature } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import React, { createContext, FC, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useConfig } from './useConfig';

export interface Transaction {
    signature: TransactionSignature;
    amount?: string;
    timestamp?: number | null;
    error?: TransactionError | null;
    status?: TransactionConfirmationStatus;
    confirmations?: number | null;
}

export interface TransactionsContextState {
    transactions: Transaction[];
}

export const TransactionsContext = createContext<TransactionsContextState>({} as TransactionsContextState);

export function useTransactions(): TransactionsContextState {
    return useContext(TransactionsContext);
}

export interface TransactionsProviderProps {
    children: ReactNode;
}

export const TransactionsProvider: FC<TransactionsProviderProps> = ({ children }) => {
    const { connection } = useConnection();
    const { recipient, token } = useConfig();
    const [associatedToken, setAssociatedToken] = useState<PublicKey>();
    const [signatures, setSignatures] = useState<TransactionSignature[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Get the ATA for the recipient and token
    useEffect(() => {
        let changed = false;

        (async () => {
            const associatedToken = await getAssociatedTokenAddress(token, recipient);
            if (!changed) {
                setAssociatedToken(associatedToken);
            }
        })();

        return () => {
            changed = true;
            setAssociatedToken(undefined);
        };
    }, [token, recipient]);

    // Poll for signatures referencing the associated token account
    useEffect(() => {
        if (!associatedToken) return;
        let changed = false;

        const interval = setInterval(async () => {
            try {
                const signatures = await connection.getSignaturesForAddress(
                    associatedToken,
                    { limit: 10 },
                    'confirmed'
                );

                if (changed) return;
                setSignatures(signatures.map(({ signature }) => signature));
            } catch (error: any) {
                console.error(error);
            }
        }, 5000);

        return () => {
            changed = true;
            clearInterval(interval);
            setSignatures([]);
        };
    }, [associatedToken, connection]);

    // When the signatures change, update the transactions
    useEffect(() => {
        if (!associatedToken) return;
        let changed = false;

        setTransactions((transactions) =>
            signatures.length && transactions.length
                ? signatures
                      .map((signature) => transactions.find((transaction) => transaction.signature === signature))
                      .filter((transaction): transaction is Transaction => !!transaction)
                : []
        );

        for (const signature of signatures) {
            (async () => {
                // TODO: replace with getParsedConfirmedTransactions and batch with statuses
                const response = await connection.getTransaction(signature, { commitment: 'confirmed' });
                if (changed) return;

                if (!response?.meta || !response.meta.preTokenBalances || !response.meta.postTokenBalances) return;

                const index = response.transaction.message.accountKeys.findIndex((pubkey) =>
                    pubkey.equals(associatedToken)
                );
                if (index === -1) return;

                const mint = token.toBase58();
                const preBalance = response.meta.preTokenBalances.find(
                    (x) => x.mint === mint && x.accountIndex === index
                );
                const postBalance = response.meta.postTokenBalances.find(
                    (x) => x.mint === mint && x.accountIndex === index
                );
                if (!preBalance?.uiTokenAmount.uiAmountString || !postBalance?.uiTokenAmount.uiAmountString) return;

                const preAmount = new BigNumber(preBalance.uiTokenAmount.uiAmountString);
                const postAmount = new BigNumber(postBalance.uiTokenAmount.uiAmountString);

                const amount = postAmount.minus(preAmount).toString();
                const timestamp = response.blockTime;
                const error = response.meta.err;

                setTransactions((transactions) =>
                    signatures.map((signature) => ({
                        ...transactions.find((transaction) => transaction.signature === signature),
                        signature,
                        amount,
                        timestamp,
                        error,
                    }))
                );
            })();
        }

        return () => {
            changed = true;
        };
    }, [associatedToken, signatures, connection, token]);

    // When the signatures change, poll and update the transaction statuses
    useEffect(() => {
        if (!associatedToken) return;
        let changed = false;

        const interval = setInterval(async () => {
            const response = await connection.getSignatureStatuses(signatures);
            if (changed) return;

            setTransactions((transactions) =>
                signatures.map((signature, index) => ({
                    ...transactions.find((transaction) => transaction.signature === signature),
                    signature,
                    status: response.value[index]?.confirmationStatus,
                    confirmations: response.value[index]?.confirmations,
                }))
            );
        }, 5000);

        return () => {
            changed = true;
            clearInterval(interval);
        };
    }, [associatedToken, connection, signatures]);

    return <TransactionsContext.Provider value={{ transactions }}>{children}</TransactionsContext.Provider>;
};
