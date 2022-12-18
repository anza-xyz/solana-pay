import React, { FC, useMemo } from 'react';
import { FormattedMessage } from "react-intl";
import { useConfig } from "../../hooks/useConfig";
import { useError } from '../../hooks/useError';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import css from './Error.module.css';

export const Error: FC = () => {
    const { status } = usePayment();
    const { errorMessage } = useError();
    const { currency } = useConfig();

    const id = useMemo(() => {
        if (status === PaymentStatus.Error && errorMessage) {
            const e = errorMessage.split(': ');
            switch (e[0]) {
                case 'WalletSignTransactionError':
                case 'WalletSendTransactionError':
                case 'TokenAccountNotFoundError':
                    return e[0];
                case 'CreateTransferError':
                    return e[1];
                case 'Error':
                    return e[1].trim() === '429'
                        ? 'NetworkBusyError' : 'UnknownError';
                default:
                    return 'UnknownError';
            }
        } else {
            return null;
        }
    }, [errorMessage, status]);

    return <div className={css.error}>{id ? <FormattedMessage id={id} values={{ error: errorMessage, currency: currency }} /> : null}</div>;
};
