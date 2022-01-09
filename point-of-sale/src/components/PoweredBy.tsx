import React, { FC } from 'react';
import * as styles from './PoweredBy.module.css';
import { SolanaPay } from './SolanaPay';

export const PoweredBy: FC = () => {
    return (
        <div className={styles.root}>
            <span className={styles.text}>Powered by</span>
            <SolanaPay />
        </div>
    );
};
