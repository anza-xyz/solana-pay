import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Activity } from './Activity';
import * as styles from './TransactionsLink.module.css';

export const TransactionsLink: FC = () => {
    return (
        <Link to="/transactions" className={styles.link}>
            <span className={styles.icon}>
                <Activity />
            </span>
            Recent Transactions
        </Link>
    );
};
