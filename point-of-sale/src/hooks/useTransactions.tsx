import { getAssociatedTokenAddress } from '@solana/spl-token';
import { useConnection } from '@solana/wallet-adapter-react';
import {
    ParsedConfirmedTransaction,
    PublicKey,
    RpcResponseAndContext,
    SignatureStatus,
    TransactionConfirmationStatus,
    TransactionError,
    TransactionSignature,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import React, { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react';
import { arraysEqual } from '../utils/arraysEqual';
import { MAX_CONFIRMATIONS } from '../utils/constants';
import { useConfig } from './useConfig';

export interface Transaction {
    signature: TransactionSignature;
    amount: string;
    timestamp: number;
    error: TransactionError | null;
    status: TransactionConfirmationStatus;
    confirmations: number;
}

export interface TransactionsContextState {
    transactions: Transaction[];
    loading: boolean;
}

export const TransactionsContext = createContext<TransactionsContextState>({} as TransactionsContextState);

export function useTransactions(): TransactionsContextState {
    return useContext(TransactionsContext);
}

export interface TransactionsProviderProps {
    children: ReactNode;
    pollInterval?: number;
}

export const TransactionsProvider: FC<TransactionsProviderProps> = ({ children, pollInterval }) => {
    pollInterval ||= 10000;

    const { connection } = useConnection();
    const { recipient, splToken } = useConfig();
    const [associatedToken, setAssociatedToken] = useState<PublicKey>();
    const [signatures, setSignatures] = useState<TransactionSignature[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    // Get the ATA for the recipient and token
    useEffect(() => {
        let changed = false;

        (async () => {
            const associatedToken = await getAssociatedTokenAddress(splToken, recipient);
            if (changed) return;

            setAssociatedToken(associatedToken);
        })();

        return () => {
            changed = true;
            setAssociatedToken(undefined);
        };
    }, [splToken, recipient]);

    // Poll for signatures referencing the associated token account
    useEffect(() => {
        if (!associatedToken) return;
        let changed = false;

        const run = async () => {
            try {
                setLoading(true);

                const confirmedSignatureInfos = await connection.getSignaturesForAddress(
                    associatedToken,
                    { limit: 10 },
                    'confirmed'
                );
                if (changed) return;

                setSignatures((prevSignatures) => {
                    const nextSignatures = confirmedSignatureInfos.map(({ signature }) => signature);
                    return arraysEqual(prevSignatures, nextSignatures) ? prevSignatures : nextSignatures;
                });
            } catch (error: any) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const interval = setInterval(run, 5000);
        void run();

        return () => {
            changed = true;
            clearInterval(interval);
            setSignatures([]);
        };
    }, [associatedToken, connection]);

    // When the signatures change, poll and update the transactions
    useEffect(() => {
        if (!signatures.length || !associatedToken) return;
        let changed = false;

        const run = async () => {
            let parsedConfirmedTransactions: (ParsedConfirmedTransaction | null)[],
                signatureStatuses: RpcResponseAndContext<(SignatureStatus | null)[]>;
            try {
                setLoading(true);

                [parsedConfirmedTransactions, signatureStatuses] = await Promise.all([
                    connection.getParsedConfirmedTransactions(signatures),
                    connection.getSignatureStatuses(signatures, { searchTransactionHistory: true }),
                ]);
            } catch (error) {
                if (changed) return;
                console.error(error);
                return;
            } finally {
                setLoading(false);
            }
            if (changed) return;

            setTransactions(
                signatures
                    .map((signature, signatureIndex): Transaction | undefined => {
                        const parsedConfirmedTransaction = parsedConfirmedTransactions[signatureIndex];
                        const signatureStatus = signatureStatuses.value[signatureIndex];
                        if (!parsedConfirmedTransaction?.meta || !signatureStatus) return;

                        const timestamp = parsedConfirmedTransaction.blockTime;
                        const error = parsedConfirmedTransaction.meta.err;
                        const status = signatureStatus.confirmationStatus;
                        if (!timestamp || !status) return;

                        const accountIndex = parsedConfirmedTransaction.transaction.message.accountKeys.findIndex(
                            ({ pubkey }) => pubkey.equals(associatedToken)
                        );
                        if (accountIndex === -1) return;

                        const preBalance = parsedConfirmedTransaction.meta.preTokenBalances?.find(
                            (x) => x.accountIndex === accountIndex
                        );
                        const postBalance = parsedConfirmedTransaction.meta.postTokenBalances?.find(
                            (x) => x.accountIndex === accountIndex
                        );
                        if (!preBalance?.uiTokenAmount.uiAmountString || !postBalance?.uiTokenAmount.uiAmountString)
                            return;

                        const preAmount = new BigNumber(preBalance.uiTokenAmount.uiAmountString);
                        const postAmount = new BigNumber(postBalance.uiTokenAmount.uiAmountString);
                        const amount = postAmount.minus(preAmount).toString();
                        const confirmations =
                            status === 'finalized' ? MAX_CONFIRMATIONS : signatureStatus.confirmations || 0;

                        return {
                            signature,
                            amount,
                            timestamp,
                            error,
                            status,
                            confirmations,
                        };
                    })
                    .filter((transaction): transaction is Transaction => !!transaction)
            );
        };

        const interval = setInterval(run, pollInterval);
        void run();

        return () => {
            changed = true;
            clearInterval(interval);
        };
    }, [signatures, connection, associatedToken, pollInterval]);

    return <TransactionsContext.Provider value={{ transactions, loading }}>{children}</TransactionsContext.Provider>;
};
