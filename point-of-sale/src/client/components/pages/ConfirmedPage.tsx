import { NextPage } from 'next';
import React from 'react';
import axios from 'axios';
import { usePayment } from '../../hooks/usePayment';
import { BackButton } from '../buttons/BackButton';
import { TransactionsLink } from '../buttons/TransactionsLink';
import { PoweredBy } from '../sections/PoweredBy';
import { Progress } from '../sections/Progress';
import css from './ConfirmedPage.module.css';

const ConfirmedPage: NextPage = () => {
    const { reset, signature } = usePayment();

    return (
        <div className={css.root}>
            <div className={css.header}>
                <BackButton onClick={reset}>Start Over</BackButton>
                <TransactionsLink />
            </div>
            <div className={css.main}>
                <Progress />
                <a
                    href={`http://localhost:3000/verify-payment`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ marginTop: '20px' }}
                >
                    <button style={{ cursor: 'pointer' }}>Go to Ultainfinity</button>
                </a>
                {/* {signature} */}
            </div>
            <div className={css.footer}>
                <PoweredBy />
            </div>
        </div>
    );
};

export default ConfirmedPage;
