import BigNumber from 'bignumber.js';
import React, { FC } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { NON_BREAKING_SPACE } from '../../utils/constants';

export interface AmountProps {
    amount: BigNumber | undefined;
}

export const Amount: FC<AmountProps> = ({ amount }) => {
    const { minDecimals } = useConfig();

    return (
        <span>
            {amount && amount.isGreaterThan(0)
                ? amount.toFormat(amount.decimalPlaces() < minDecimals ? minDecimals : amount.decimalPlaces())
                : NON_BREAKING_SPACE}
        </span>
    );
};
