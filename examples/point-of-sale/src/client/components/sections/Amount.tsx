import BigNumber from 'bignumber.js';
import React, { FC, useMemo } from 'react';
import { FormattedMessage } from "react-intl";
import { useConfig } from '../../hooks/useConfig';
import { NON_BREAKING_SPACE } from '../../utils/constants';
import css from './Amount.module.css';

export interface AmountProps {
    value: BigNumber | number | string | undefined;
    showZero?: boolean;
}

export const Amount: FC<AmountProps> = ({ value, showZero }) => {
    const { minDecimals, maxDecimals, currencyPattern } = useConfig();

    const amount = useMemo(() => {
        const num = value ? parseFloat(value.toString()) : NaN;
        if (isNaN(num) || (num <= 0 && !showZero)) return NON_BREAKING_SPACE;
        if (typeof value === 'string') return value;
        const bignumber = new BigNumber(value ? value : 0);
        let text;
        if (bignumber.isGreaterThan(0)) {
            const decimals = bignumber.decimalPlaces() ?? 0;
            text = bignumber.toFormat(decimals < minDecimals ? minDecimals : decimals);
        } else {
            text = '0';
        }

        return new Intl.NumberFormat(undefined, { maximumFractionDigits: maxDecimals }).format(parseFloat(text));
    }, [value, minDecimals, maxDecimals, showZero]);

    return <span>{amount !== NON_BREAKING_SPACE ? <FormattedMessage id="currencyPattern" defaultMessage={currencyPattern} values={{
        span: chunks => <span className={css.currency}>{chunks}</span>,
        value: amount
    }} /> : amount}</span>;
};
