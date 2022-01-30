import React, { FC } from 'react';
import { FullscreenButton } from '../buttons/FullscreenButton';
import { GenerateButton } from '../buttons/GenerateButton';
import { TransactionsLink } from '../buttons/TransactionsLink';
import { NumPad } from '../sections/NumPad';
import { PoweredBy } from '../sections/PoweredBy';
import { Summary } from '../sections/Summary';
import * as styles from './NewPage.module.pcss';

export const NewPage: FC = () => {
    return (
        <div className={styles.root}>
            <div className={styles.main}>
                <div className={styles.body}>
                    <NumPad />
                </div>
                <div className={styles.footer}>
                    <PoweredBy />
                </div>
            </div>
            <div className={styles.side}>
                <div className={styles.top}>
                    <FullscreenButton />
                </div>
                <div className={styles.summary}>
                    <Summary />
                    <GenerateButton />
                </div>
                <div className={styles.bottom}>
                    <TransactionsLink />
                </div>
            </div>
        </div>
    );
};
