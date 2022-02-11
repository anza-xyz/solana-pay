import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { usePayment } from '../../hooks/usePayment';
import { Digits } from '../../types';
import { BackspaceIcon } from '../images/BackspaceIcon';

import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import * as css from './NumPad.module.pcss';

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

interface ListingProps {
    id: string;
    name: string;
    url: string;
    onBuy: (name: string) => void;
}

export const Listing: FC<ListingProps> = ({id, name, url, onBuy}: ListingProps) => {
    const handleBuy = () => {
        onBuy(id);
    };
    return (
        <Card sx={{ maxWidth: "260px" }}>
            <CardMedia
                component="img"
                alt={name}
                height="260"
                image={url}
            />
        <CardContent>
            <Typography gutterBottom variant="h5" component="div">
                {name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                0.01 SOL ($1.04)
            </Typography>
        </CardContent>
        <CardActions>
            <Button variant="contained" size="large" onClick={handleBuy}>Buy Now</Button>
        </CardActions>
    </Card>
        // <div className={css.root}>
        //     <img style={{width: '250px'}} src={url}/>
        //     <div className={css.text}>
        //         {name}
        //     </div>
        //     <button>Buy Now</button>
        // </div>
    );
    // const { symbol, decimals } = useConfig();
    // const regExp = useMemo(() => new RegExp('^\\d*([.,]\\d{0,' + decimals + '})?$'), [decimals]);

    // const [value, setValue] = useState('0');
    // const onInput = useCallback(
    //     (key) =>
    //         setValue((value) => {
    //             let newValue = (value + key).trim().replace(/^0{2,}/, '0');
    //             if (newValue) {
    //                 newValue = /^[.,]/.test(newValue) ? `0${newValue}` : newValue.replace(/^0+(\d)/, '$1');
    //                 if (regExp.test(newValue)) return newValue;
    //             }
    //             return value;
    //         }),
    //     [regExp]
    // );
    // const onBackspace = useCallback(() => setValue((value) => (value.length ? value.slice(0, -1) || '0' : value)), []);

    // const { setAmount } = usePayment();
    // useEffect(() => setAmount(value ? new BigNumber(value) : undefined), [setAmount, value]);

    // return (
    //     <div className={css.root}>
    //         <div className={css.text}>Enter amount in {symbol}</div>
    //         <div className={css.value}>{value}</div>
    //         <div className={css.buttons}>
    //             <div className={css.row}>
    //                 <NumPadButton input={1} onInput={onInput} />
    //                 <NumPadButton input={2} onInput={onInput} />
    //                 <NumPadButton input={3} onInput={onInput} />
    //             </div>
    //             <div className={css.row}>
    //                 <NumPadButton input={4} onInput={onInput} />
    //                 <NumPadButton input={5} onInput={onInput} />
    //                 <NumPadButton input={6} onInput={onInput} />
    //             </div>
    //             <div className={css.row}>
    //                 <NumPadButton input={7} onInput={onInput} />
    //                 <NumPadButton input={8} onInput={onInput} />
    //                 <NumPadButton input={9} onInput={onInput} />
    //             </div>
    //             <div className={css.row}>
    //                 <NumPadButton input="." onInput={onInput} />
    //                 <NumPadButton input={0} onInput={onInput} />
    //                 <button className={css.button} type="button" onClick={onBackspace}>
    //                     <BackspaceIcon />
    //                 </button>
    //             </div>
    //         </div>
    //     </div>
    // );
};
