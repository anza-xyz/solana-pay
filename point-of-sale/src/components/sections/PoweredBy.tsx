import React, { FC } from 'react';
import * as styles from './PoweredBy.module.css';
import { SolanaPayLogo } from '../images/SolanaPayLogo';

export const PoweredBy: FC = () => {
    return (
        <div className={styles.root}>
            <span className={styles.text}>Powered by</span>
            <SolanaPayLogo />
        </div>
    );
};
