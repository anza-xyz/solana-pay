import React, { FC, useMemo } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import { SHOW_SYMBOL } from '../../utils/env';
import { Amount } from './Amount';
import css from './TransactionInfo.module.css';

export const TransactionInfo: FC = () => {
    const { status } = usePayment();
    const { symbol, currency, label } = useConfig();
    const { amount } = usePayment();
    const date = useMemo(() => new Date().toLocaleString("fr-FR"), []);
    const isNewStatus = useMemo(() => status === PaymentStatus.New, [status]);
    const isPaidStatus = useMemo(() => status === PaymentStatus.Finalized || status === PaymentStatus.Valid || status === PaymentStatus.Invalid || status === PaymentStatus.Confirmed || status === PaymentStatus.Error, [status]);

    return (
        <div className={css.root}>
            <div className={css.symbol}>{isPaidStatus ? date : null}</div>
            <div className={css.symbol}>{!isNewStatus ? label : "Retour à l'envoyeur !"}</div>
            <div className={!isNewStatus ? css.amount : css.amountHidden}>
                <Amount amount={amount} />{SHOW_SYMBOL ? symbol : null}
            </div>
            {!SHOW_SYMBOL ? <div className={!isNewStatus ? css.symbol : css.symbolHidden}>{currency}</div> : null}
        </div>
    );
};
