import React, { FC } from 'react';
import { SolanaPayLogo } from '../images/SolanaPayLogo';
import css from './PoweredBy.module.css';

export const PoweredBy: FC = () => {
    //TODO : Add translastion
    return (
        <div className={css.root}>
            Basé sur <SolanaPayLogo />
        </div>
    );
};
