import React, { FC, useMemo } from 'react';
import { useError } from '../../hooks/useError';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import css from './Error.module.css';

export const Error: FC = () => {
    const { status } = usePayment();
    const { errorMessage } = useError();

    const text = useMemo(() => {
        if (status === PaymentStatus.Error) {
            switch (errorMessage) {
                case 'WalletSignTransactionError: Transaction cancelled':
                    return 'Vous avez refusé la transaction !';
                case 'WalletSendTransactionError: failed to send transaction: Transaction simulation failed: Blockhash not found':
                    return 'Vous avez trop tardé à approuver la transaction !';
                case 'CreateTransferError: insufficient funds':
                    return 'Le montant est supérieur à vos fonds !';
                case 'CreateTransferError: recipient not found':
                    return "Le porte-monnaie de ce commerçant à besoin d'être initialisé !";
                default:
                    return errorMessage;
            }
        } else {
            return null;
        }
    }, [errorMessage]);

    return <div className={css.error}>{text}</div>;
};
