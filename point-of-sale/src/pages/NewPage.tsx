import React, { FC } from 'react';
import { Generate } from '../components/Generate';
import { NumPad } from '../components/NumPad';
import { PoweredBy } from '../components/PoweredBy';
import { Summary } from '../components/Summary';
import { TransactionsLink } from '../components/TransactionsLink';
import * as styles from './NewPage.module.css';

export const NewPage: FC = () => {
    return (
        <div className={styles.root}>
            <div className={styles.main}>
                <TransactionsLink />
                <div className={styles.body}>
                    <NumPad />
                </div>
            </div>
            <div className={styles.side}>
                <div className={styles.header}>
                    <Summary />
                    <Generate />
                </div>
                <div className={styles.footer}>
                    <PoweredBy />
                </div>
            </div>
        </div>
    );
};
