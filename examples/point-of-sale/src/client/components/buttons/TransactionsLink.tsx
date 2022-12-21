import Link from 'next/link';
import React, { FC } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useLinkWithQuery } from '../../hooks/useLinkWithQuery';
import { ActivityIcon } from '../images/ActivityIcon';
import css from './TransactionsLink.module.css';
import { IS_CUSTOMER_POS } from '../../utils/env';
import { FormattedMessage } from "react-intl";

export const TransactionsLink: FC = () => {
    const to = useLinkWithQuery('/transactions');
    const phone = useMediaQuery({ query: '(max-width: 767px)' });

    return !IS_CUSTOMER_POS ? (
        <Link href={to} passHref className={css.link}>
            <ActivityIcon />
            {!phone ? <FormattedMessage id="recentTransactions" /> : null}
        </Link>
    ) : null;
};
