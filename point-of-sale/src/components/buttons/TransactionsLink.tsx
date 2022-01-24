import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { useLinkWithQuery } from '../../hooks/useLinkWithQuery';
import { ActivityIcon } from '../images/ActivityIcon';
import * as styles from './TransactionsLink.module.css';

export const TransactionsLink: FC = () => {
    const to = useLinkWithQuery('/transactions');

    return (
        <Link to={to} className={styles.link}>
            <ActivityIcon />
            Recent Transactions
        </Link>
    );
};
