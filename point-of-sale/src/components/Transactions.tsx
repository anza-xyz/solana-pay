import React, { FC } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { useConfig } from '../hooks/useConfig';
import * as styles from './Transactions.module.css';

export const Transactions: FC = () => {
    const { recipient, token } = useConfig();

    return <div className={styles.root}></div>;
};
