import React, { FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Activity } from './Activity';
import * as styles from './TransactionsLink.module.css';

export const TransactionsLink: FC = () => {
    const { config } = useParams();
    return (
        <Link to={`/${config}/transactions`} className={styles.link}>
            <span className={styles.icon}>
                <Activity />
            </span>
            Recent Transactions
        </Link>
    );
};
