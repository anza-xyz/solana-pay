import { useRouter } from 'next/router';
import React, { FC, useCallback } from 'react';
import { BackButton } from '../../components/buttons/BackButton';
import { PoweredBy } from '../../components/sections/PoweredBy';
import { Transactions } from '../../components/sections/Transactions';
import css from './transactions.module.css';

export default function TransactionsRoute() {
    const router = useRouter();
    const onClick = useCallback(() => router.back(), [router]);

    return (
        <div className={css.root}>
            <div className={css.header}>
                <BackButton onClick={onClick}>Back</BackButton>
            </div>
            <div className={css.main}>
                <Transactions />
            </div>
            <PoweredBy />
        </div>
    );
};
