import React, { FC } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { usePayment } from '../../hooks/usePayment';
import { SHOW_SYMBOL } from '../../utils/env';
import { Amount } from './Amount';
import css from './Summary.module.css';

export const Summary: FC = () => {
    const { symbol, currency, label } = useConfig();
    const { amount } = usePayment();

    //TODO : Add translastion
    return (
        <div className={css.root}>
            <div className={css.title}>Solde</div>
            <div className={css.total}>
                <div className={css.totalLeft}>Total</div>
                <div className={css.totalRight}>
                    <div className={css.symbol}>{label}</div>
                    {!SHOW_SYMBOL ? <div className={css.symbol}>{currency}</div> : null}
                    <div className={css.amount}>
                        {SHOW_SYMBOL ? symbol : null}
                        <Amount amount={amount} />
                    </div>
                </div>
            </div>
        </div>
    );
};
