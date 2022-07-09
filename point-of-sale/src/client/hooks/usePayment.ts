import { useContext } from 'react';
import { PaymentContext, PaymentContextState } from '../components/contexts/PaymentProvider';

export function usePayment(): PaymentContextState {
    return useContext(PaymentContext);
}
