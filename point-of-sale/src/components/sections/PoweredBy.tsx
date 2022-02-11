import React, { FC } from 'react';
import { SolanaPayLogo } from '../images/SolanaPayLogo';
import * as css from './PoweredBy.module.pcss';

export const PoweredBy: FC = () => {
    return (
        <div className={css.root}>
            Powered by <SolanaPayLogo />
        </div>
    );
};
