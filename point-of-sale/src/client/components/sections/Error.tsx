import React, { FC, useMemo } from 'react';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import css from './Error.module.css';

export const Error: FC = () => {
    const { error, status } = usePayment();

    const errorMessage = useMemo(() => {
        if (status === PaymentStatus.Error) {
            switch (error) {
                case 'WalletSignTransactionError: Transaction cancelled':
                    return 'Vous avez refusé la transaction !';
                case 'WalletSendTransactionError: failed to send transaction: Transaction simulation failed: Blockhash not found':
                    return 'Vous avez trop tardé à approuver la transaction !';
                case 'CreateTransferError: insufficient funds':
                    return 'Le montant est supérieur à vos fonds !';
                default:
                    return error;
            }
        } else {
            return null;
        }
    }, []);

    return <div className={css.error}>{errorMessage}</div>;
};
