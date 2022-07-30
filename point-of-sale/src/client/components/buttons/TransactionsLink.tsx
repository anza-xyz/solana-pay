import Link from 'next/link';
import React, { FC } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useLinkWithQuery } from '../../hooks/useLinkWithQuery';
import { ActivityIcon } from '../images/ActivityIcon';
import css from './TransactionsLink.module.css';

export const TransactionsLink: FC = () => {
    const to = useLinkWithQuery('/transactions');
    const phone = useMediaQuery({ query: '(max-width: 767px)' });
    const isMerchantPOS = Boolean(process.env.NEXT_PUBLIC_IS_MERCHANT_POS) || false;

    return isMerchantPOS ? (
        <Link href={to} passHref>
            <a className={css.link}>
                <ActivityIcon />
                {phone ? null : 'Recent Transactions'}
            </a>
        </Link>
    ) : null;
};
