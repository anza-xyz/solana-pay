import React, { FC, HTMLAttributes, ReactNode } from 'react';
import * as styles from './BackButton.module.css';

export interface BackButtonProps {
    children: ReactNode;
    onClick: HTMLAttributes<HTMLButtonElement>['onClick'];
}

export const BackButton: FC<BackButtonProps> = ({ children, onClick }) => {
    return (
        <button className={styles.button} type="button" onClick={onClick}>
            <span className={styles.icon}>◄</span>
            {children}
        </button>
    );
};
