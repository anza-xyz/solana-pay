import React, { FC } from 'react';
import { Generate } from '../components/Generate';
import { NumPad } from '../components/NumPad';
import { PoweredBy } from '../components/PoweredBy';
import { Summary } from '../components/Summary';
import * as styles from './NewPage.module.css';

export const NewPage: FC = () => {
    return (
        <div className={styles.root}>
            <div className={styles.main}>
                <NumPad />
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
