import React, { FC, useMemo } from 'react';
import { FormattedMessage } from "react-intl";
import { useConfig } from '../../hooks/useConfig';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import { Amount } from './Amount';
import css from './TransactionInfo.module.css';

export const TransactionInfo: FC = () => {
    const { status } = usePayment();
    const { label } = useConfig();
    const { amount } = usePayment();
    const date = useMemo(() => new Intl.DateTimeFormat(undefined, {
        year: 'numeric', month: 'short', day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    }).format(new Date()), []);
    const isNewStatus = useMemo(() => status === PaymentStatus.New, [status]);
    const isPaidStatus = useMemo(() => status === PaymentStatus.Finalized || status === PaymentStatus.Valid || status === PaymentStatus.Invalid || status === PaymentStatus.Confirmed || status === PaymentStatus.Error, [status]);

    return (
        <div className={css.root}>
            <div className={css.symbol}>{isPaidStatus ? date : null}</div>
            <div className={css.symbol}>{!isNewStatus ? label : <FormattedMessage id="reinit" />}</div>
            <div className={!isNewStatus ? css.amount : css.amountHidden}>
                <Amount value={amount} />
            </div>
        </div>
    );
};
