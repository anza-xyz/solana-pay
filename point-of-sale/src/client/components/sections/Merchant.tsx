import Image from 'next/image';
import React, { FC, useCallback, useMemo } from 'react';
import { useNavigateWithQuery } from '../../hooks/useNavigateWithQuery';
import { MERCHANT_IMAGE_PATH } from '../../utils/env';
import css from './Merchant.module.css';

export interface MerchantInfo {
    index: number;
    company: string;
}

export interface MerchantProps {
    merchant: MerchantInfo;
}

export const Merchant: FC<MerchantProps> = ({ merchant }) => {
    const { index: id, company: label } = merchant;
    const merchantImageSrc = MERCHANT_IMAGE_PATH + id + '.png';

    const navigate = useNavigateWithQuery();

    const select = useCallback(() => {
        navigate('/new?id=' + id);
    }, [navigate]);

    return (
        <div className={css.body}>
            <div className={css.row}>
                <Image
                    className={css.image}
                    src={merchantImageSrc}
                    alt="Merchant Logo"
                    height={250}
                    width={250}
                    onClick={select}
                />
            </div>
            <div className={css.row}>
                <div className={css.label} onClick={select}>
                    {label}
                </div>
            </div>
        </div>
    );
};
