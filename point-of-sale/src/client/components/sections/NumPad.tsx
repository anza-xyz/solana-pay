import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { usePayment } from '../../hooks/usePayment';
import { Digits } from '../../types';
import { BackspaceIcon } from '../images/BackspaceIcon';
import css from './NumPad.module.css';

interface NumPadInputButton {
    input: Digits | '.';
    onInput(key: Digits | '.'): void;
}

const NumPadButton: FC<NumPadInputButton> = ({ input, onInput }) => {
    const onClick = useCallback(() => onInput(input), [onInput, input]);
    return (
        <button className={css.button} type="button" onClick={onClick}>
            {input}
        </button>
    );
};

export const NumPad: FC = () => {
    const { symbol, curName, decimals } = useConfig();
    const regExp = useMemo(() => new RegExp('^\\d*([.,]\\d{0,' + decimals + '})?$'), [decimals]);

    const [value, setValue] = useState('0');
    const onInput = useCallback(
        (key) =>
            setValue((value) => {
                let newValue = (value + key).trim().replace(/^0{2,}/, '0');
                if (newValue) {
                    newValue = /^[.,]/.test(newValue) ? `0${newValue}` : newValue.replace(/^0+(\d)/, '$1');
                    if (regExp.test(newValue)) return newValue;
                }
                return value;
            }),
        [regExp]
    );
    const onBackspace = useCallback(() => setValue((value) => (value.length ? value.slice(0, -1) || '0' : value)), []);

    const { setAmount } = usePayment();
    useEffect(() => setAmount(value ? new BigNumber(value) : undefined), [setAmount, value]);

    const showSymbol = Boolean(process.env.NEXT_PUBLIC_SHOW_SYMBOL) || false;
    const currency = showSymbol ? symbol : curName;

    //TODO : Add translastion
    return (
        <div className={css.root}>
            <div className={css.text}>Montant en {currency}</div>
            <div className={css.value}>{value}</div>
            <div className={css.buttons}>
                <div className={css.row}>
                    <NumPadButton input={1} onInput={onInput} />
                    <NumPadButton input={2} onInput={onInput} />
                    <NumPadButton input={3} onInput={onInput} />
                </div>
                <div className={css.row}>
                    <NumPadButton input={4} onInput={onInput} />
                    <NumPadButton input={5} onInput={onInput} />
                    <NumPadButton input={6} onInput={onInput} />
                </div>
                <div className={css.row}>
                    <NumPadButton input={7} onInput={onInput} />
                    <NumPadButton input={8} onInput={onInput} />
                    <NumPadButton input={9} onInput={onInput} />
                </div>
                <div className={css.row}>
                    <NumPadButton input="." onInput={onInput} />
                    <NumPadButton input={0} onInput={onInput} />
                    <button className={css.button} type="button" onClick={onBackspace}>
                        <BackspaceIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};
