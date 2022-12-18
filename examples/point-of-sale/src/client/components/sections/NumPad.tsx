import { useWallet } from "@solana/wallet-adapter-react";
import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, FormattedNumber } from "react-intl";
import { useConfig } from '../../hooks/useConfig';
import { usePayment } from '../../hooks/usePayment';
import { Digits } from '../../types';
import { IS_CUSTOMER_POS } from '../../utils/env';
import { isFullscreen, requestFullscreen } from "../../utils/fullscreen";
import { BackspaceIcon } from '../images/BackspaceIcon';
import { Amount } from "./Amount";
import css from './NumPad.module.css';

interface NumPadInputButton {
    input: Digits | '.';
    onInput(key: Digits | '.'): void;
}

const NumPadButton: FC<NumPadInputButton> = ({ input, onInput }) => {
    const onClick = useCallback(() => {
        if (IS_CUSTOMER_POS && !isFullscreen()) {
            requestFullscreen();
        }
        onInput(input);
    }, [onInput, input]);
    return (
        <button className={css.button} type="button" onClick={onClick}>
            {input}
        </button>
    );
};

export const NumPad: FC = () => {
    const { minDecimals, maxValue } = useConfig();
    const { balance } = usePayment();
    const { publicKey } = useWallet();

    const regExp = useMemo(() => new RegExp('^\\d*([.,]\\d{0,' + minDecimals + '})?$'), [minDecimals]);

    const [value, setValue] = useState('0');
    const onInput = useCallback(
        (key: Digits | '.') =>
            setValue((value) => {
                let newValue = (value + key).trim().replace(/^0{2,}/, '0');
                if (newValue) {
                    newValue = /^[.,]/.test(newValue) ? `0${newValue}` : newValue.replace(/^0+(\d)/, '$1');
                    if (regExp.test(newValue)) return parseFloat(newValue) <= maxValue ? newValue : maxValue.toString();
                }
                return value;
            }),
        [regExp, maxValue]
    );
    const onBackspace = useCallback(() => setValue((value) => (value.length ? value.slice(0, -1) || '0' : value)), []);

    const { setAmount } = usePayment();
    useEffect(() => setAmount(value ? new BigNumber(value) : undefined), [setAmount, value]);

    const hasInsufficientBalance = useMemo(() => balance && (balance <= 0 || balance < parseFloat(value)), [balance, value]);
    const hasBalance = useMemo(() => balance && balance >= 0, [balance]);

    return (
        <div className={css.root}>
            <div className={publicKey ? !hasInsufficientBalance ? css.bold : css.red : css.hidden}>
                {balance ? balance >= 0 ?
                    <div>
                        <FormattedMessage id="yourBalance" />
                        <Amount value={balance} />
                        {balance < parseFloat(value) ? <FormattedMessage id="insufficient" /> : null}
                    </div>
                    : <FormattedMessage id="emptyBalance" /> : <FormattedMessage id="balanceLoading" />}
            </div>
            <div className={hasBalance ? css.text : css.hidden}><FormattedMessage id="toPay" /></div>
            <div className={hasBalance ? css.value : css.hidden}>
                <Amount value={value} showZero />
            </div>
            <div className={hasBalance ? css.buttons : css.hidden}>
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
