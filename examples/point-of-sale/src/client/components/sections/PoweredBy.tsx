import React, { FC } from 'react';
import { FormattedMessage } from "react-intl";
import { SolanaPayLogo } from '../images/SolanaPayLogo';
import css from './PoweredBy.module.css';

export const PoweredBy: FC = () => {
    return (
        <div className={css.root}>
            <FormattedMessage id="poweredBy" />
            <SolanaPayLogo />
        </div>
    );
};
