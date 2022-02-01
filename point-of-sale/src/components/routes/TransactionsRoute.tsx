import React, { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../buttons/BackButton';
import { FullscreenButton } from '../buttons/FullscreenButton';
import { PoweredBy } from '../sections/PoweredBy';
import { Transactions } from '../sections/Transactions';
import * as css from './TransactionsRoute.module.pcss';

export const TransactionsRoute: FC = () => {
    const navigate = useNavigate();
    const onClick = useCallback(() => navigate(-1), [navigate]);

    return (
        <div className={css.root}>
            <div className={css.header}>
                <BackButton onClick={onClick}>Back</BackButton>
                <FullscreenButton />
            </div>
            <div className={css.main}>
                <Transactions />
            </div>
            <PoweredBy />
        </div>
    );
};
