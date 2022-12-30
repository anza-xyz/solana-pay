import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { MouseEventHandler, useCallback, useState } from 'react';
import { FormattedMessage } from "react-intl";
import { BackButton } from '../buttons/BackButton';
import { PoweredBy } from '../sections/PoweredBy';
import { Transactions } from '../sections/Transactions';
import css from './TransactionsPage.module.css';

const TransactionsPage: NextPage = () => {
    const router = useRouter();
    const [disabled, setDisabled] = useState(false);
    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            setDisabled(true);
            router.back();
        },
        [router]
    );


    return (
        <div className={css.root}>
            <div className={css.header}>
                <BackButton onClick={handleClick}><FormattedMessage id="back" /></BackButton>
            </div>
            <div className={!disabled ? css.main : css.mainHidden}>
                <Transactions />
            </div>
            <PoweredBy />
        </div>
    );
};

export default TransactionsPage;
