import React, { FC } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';
import { useLinkWithQuery } from '../../hooks/useLinkWithQuery';
import { ActivityIcon } from '../images/ActivityIcon';
import * as css from './TransactionsLink.module.pcss';

export const TransactionsLink: FC = () => {
    const to = useLinkWithQuery('/transactions');
    const phone = useMediaQuery({ query: '(max-width: 767px)' });

    return (
        <Link to={to} className={css.link}>
            <ActivityIcon />
            {phone ? null : 'Recent Transactions'}
        </Link>
    );
};
