import { NextPage } from 'next';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMediaQuery } from 'react-responsive';
import { usePayment } from '../../hooks/usePayment';
import { FullscreenButton } from '../buttons/FullscreenButton';
import { GenerateButton } from '../buttons/GenerateButton';
import { TransactionsLink } from '../buttons/TransactionsLink';
import { NumPad } from '../sections/NumPad';
import { PoweredBy } from '../sections/PoweredBy';
import { Summary } from '../sections/Summary';
import css from './NewPage.module.css';
import BigNumber from 'bignumber.js';

const NewPage: NextPage = () => {
    const phone = useMediaQuery({ query: '(max-width: 767px)' });
    const { query } = useRouter();
    const { setAmount } = usePayment();

    useEffect(() => {
        if (query.amount) {
            setAmount(BigNumber(parseInt(query.amount as string)))
        }
    }, [query.amount, setAmount])

    return phone ? (
        <div className={css.root}>
            <div className={css.top}>
                <FullscreenButton />
                <TransactionsLink />
            </div>
            <div className={css.body}>
                {/* <NumPad /> */}
                <GenerateButton />
            </div>
            <PoweredBy />
        </div>
    ) : (
        <div className={css.root}>
            <div className={css.main}>
                <div className={css.top}>
                    <FullscreenButton />
                </div>
                <div className={css.body}>{/* <NumPad /> */}</div>
                <PoweredBy />
            </div>
            <div className={css.side}>
                <div className={css.summary}>
                    <Summary />
                    <GenerateButton />
                </div>
                <div className={css.bottom}>
                    <TransactionsLink />
                </div>
            </div>
        </div>
    );
};

export default NewPage;

export function getServerSideProps() {
    // Required so getInitialProps re-runs on the server-side
    // If it runs on client-side then there's no req and the URL reading doesn't work
    // See https://nextjs.org/docs/api-reference/data-fetching/get-initial-props
    return {
        props: {},
    };
}
