import { useContext } from 'react';
import { TransactionsContext, TransactionsContextState } from '../components/contexts/TransactionsProvider';

export function useTransactions(): TransactionsContextState {
    return useContext(TransactionsContext);
}
