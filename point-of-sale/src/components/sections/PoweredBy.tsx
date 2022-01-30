import React, { FC } from 'react';
import { SolanaPayLogo } from '../images/SolanaPayLogo';
import * as styles from './PoweredBy.module.pcss';

export const PoweredBy: FC = () => {
    return (
        <div className={styles.root}>
            <span className={styles.text}>Powered by</span>
            <SolanaPayLogo />
        </div>
    );
};
