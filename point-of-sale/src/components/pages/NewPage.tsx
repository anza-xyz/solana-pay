import React, { FC } from 'react';
import { FullscreenButton } from '../buttons/FullscreenButton';
import { GenerateButton } from '../buttons/GenerateButton';
import { NumPad } from '../sections/NumPad';
import { PoweredBy } from '../sections/PoweredBy';
import { Summary } from '../sections/Summary';
import { TransactionsLink } from '../buttons/TransactionsLink';
import * as styles from './NewPage.module.css';

export const NewPage: FC = () => {
    return (
        <div className={styles.root}>
            <div className={styles.main}>
                <div className={styles.buttons}>
                    <TransactionsLink />
                    <FullscreenButton />
                </div>
                <div className={styles.body}>
                    <NumPad />
                </div>
            </div>
            <div className={styles.side}>
                <div className={styles.header}>
                    <Summary />
                    <GenerateButton />
                </div>
                <div className={styles.footer}>
                    <PoweredBy />
                </div>
            </div>
        </div>
    );
};
