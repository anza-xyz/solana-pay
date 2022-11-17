import React, { FC, useMemo } from 'react';
import { useError } from '../../hooks/useError';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import css from './Error.module.css';

export const Error: FC = () => {
    const { status } = usePayment();
    const { errorMessage } = useError();

    const text = useMemo(() => {
        if (status === PaymentStatus.Error && errorMessage) {
            const e = errorMessage.split(': ');
            switch (e[0]) {
                case 'WalletSignTransactionError':
                    return 'Vous avez refusé la transaction !';
                case 'WalletSendTransactionError':
                    return 'Vous avez trop tardé à approuver la transaction !';
                case 'CreateTransferError':
                    return e[1] === 'insufficient funds'
                        ? 'Le montant est supérieur à vos fonds !'
                        : e[1] === 'recipient not found'
                            ? "Le porte-monnaie de ce commerçant à besoin d'être initialisé !"
                            : 'Erreur de transfert !';
                default:
                    return 'Erreur inconnue : ' + errorMessage;
            }
        } else {
            return null;
        }
    }, [errorMessage, status]);

    return <div className={css.error}>{text}</div>;
};