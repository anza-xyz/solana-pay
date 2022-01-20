import React, { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { FullscreenButton } from '../components/FullscreenButton';
import { PoweredBy } from '../components/PoweredBy';
import { Transactions } from '../components/Transactions';
import * as styles from './TransactionsPage.module.css';

export const TransactionsPage: FC = () => {
    const navigate = useNavigate();
    const onClick = useCallback(() => navigate(-1), [navigate]);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <BackButton onClick={onClick}>Back</BackButton>
                <FullscreenButton />
            </div>
            <div className={styles.main}>
                <Transactions />
            </div>
            <div className={styles.footer}>
                <PoweredBy />
            </div>
        </div>
    );
};
