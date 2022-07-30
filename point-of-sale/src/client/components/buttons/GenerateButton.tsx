import React, { FC } from 'react';
import { usePayment } from '../../hooks/usePayment';
import css from './GenerateButton.module.css';

export const GenerateButton: FC = () => {
    const { amount, generate } = usePayment();

    //TODO : Add translastion
    return (
        <button
            className={css.root}
            type="button"
            onClick={generate}
            disabled={!amount || amount.isLessThanOrEqualTo(0)}
        >
            Payer
        </button>
    );
};
