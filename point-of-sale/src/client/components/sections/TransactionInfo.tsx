import React, { FC } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import { SHOW_SYMBOL } from '../../utils/env';
import { Amount } from './Amount';
import css from './TransactionInfo.module.css';

export const TransactionInfo: FC = () => {
    const { status } = usePayment();
    const { symbol, currency, label } = useConfig();
    const { amount } = usePayment();
    const isNewStatus = status === PaymentStatus.New;

    return (
        <div>
            <div className={css.symbol}>{!isNewStatus ? label : "Retour à l'envoyeur !"}</div>
            <div className={!isNewStatus ? css.amount : css.amountHidden}>
                {SHOW_SYMBOL ? symbol : null}
                <Amount amount={amount} />
            </div>
            {!SHOW_SYMBOL ? <div className={!isNewStatus ? css.symbol : css.symbolHidden}>{currency}</div> : null}
        </div>
    );
};
