import React, { FC } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { usePayment } from '../../hooks/usePayment';
import { Amount } from './Amount';
import css from './Summary.module.css';

export const Summary: FC = () => {
    const { symbol, curName } = useConfig();
    const { amount } = usePayment();

    const showSymbol = Boolean(process.env.NEXT_PUBLIC_SHOW_SYMBOL) || false;
    const currency = showSymbol ? symbol : curName;

    //TODO : Add translastion
    return (
        <div className={css.root}>
            <div className={css.title}>Solde</div>
            <div className={css.total}>
                <div className={css.totalLeft}>Total</div>
                <div className={css.totalRight}>
                    <div className={css.symbol}>{currency}</div>
                    <div className={css.amount}>
                        <Amount amount={amount} />
                    </div>
                </div>
            </div>
        </div>
    );
};
