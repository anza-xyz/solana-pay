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

    return (
        <div className={css.root}>
            <div className={css.symbol}>{status === PaymentStatus.Finalized || status === PaymentStatus.Valid || status === PaymentStatus.Invalid || status === PaymentStatus.Confirmed ? date : null}</div>
            <div className={css.symbol}>{!isNewStatus ? label : "Retour à l'envoyeur !"}</div>
            <div className={!isNewStatus ? css.amount : css.amountHidden}>
                {SHOW_SYMBOL ? symbol : null}
                <Amount amount={amount} />
            </div>
            {!SHOW_SYMBOL ? <div className={!isNewStatus ? css.symbol : css.symbolHidden}>{currency}</div> : null}
        </div>
    );
};
