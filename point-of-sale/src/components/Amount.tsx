import React, { FC } from 'react';
import { useConfig } from '../hooks/useConfig';
import { usePayment } from '../hooks/usePayment';

export const Amount: FC = () => {
    const { minDecimals } = useConfig();
    const { amount } = usePayment();

    return (
        <span>
            {amount && amount.isGreaterThan(0)
                ? amount.toFormat(amount.decimalPlaces() < minDecimals ? minDecimals : amount.decimalPlaces())
                : '\u00a0'}
        </span>
    );
};
