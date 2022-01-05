import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useConfig } from '../hooks/useConfig';
import { useInput } from '../hooks/useInput';
import { Digits } from '../types';

import * as classes from './NumPad.module.css';

interface NumPadInputButton {
    input: Digits | '.';
    onInput(key: Digits | '.'): void;
}

const NumPadButton: FC<NumPadInputButton> = ({ input, onInput }) => {
    const onClick = useCallback(() => onInput(input), [onInput, input]);
    return (
        <button className={classes.button} type="button" onClick={onClick}>
            {input}
        </button>
    );
};

export const NumPad: FC = () => {
    const { decimals } = useConfig();
    const regExp = useMemo(() => new RegExp('^\\d*([.,]\\d{0,' + decimals + '})?$'), [decimals]);

    const [value, setValue] = useState('');
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
        [setValue]
    );
    const onBackspace = useCallback(() => setValue((value) => (value.length ? value.slice(0, -1) : value)), [setValue]);

    const { setAmount } = useInput();
    useEffect(() => setAmount(value ? new BigNumber(value) : undefined), [value]);

    return (
        <div className={classes.root}>
            <h1 className={classes.value}>{value && '$' + value}</h1>
            <div className={classes.row}>
                <NumPadButton input={1} onInput={onInput} />
                <NumPadButton input={2} onInput={onInput} />
                <NumPadButton input={3} onInput={onInput} />
            </div>
            <div className={classes.row}>
                <NumPadButton input={4} onInput={onInput} />
                <NumPadButton input={5} onInput={onInput} />
                <NumPadButton input={6} onInput={onInput} />
            </div>
            <div className={classes.row}>
                <NumPadButton input={7} onInput={onInput} />
                <NumPadButton input={8} onInput={onInput} />
                <NumPadButton input={9} onInput={onInput} />
            </div>
            <div className={classes.row}>
                <NumPadButton input="." onInput={onInput} />
                <NumPadButton input={0} onInput={onInput} />
                <button className={classes.button} type="button" onClick={onBackspace}>
                    ⌫
                </button>
            </div>
        </div>
    );
};
