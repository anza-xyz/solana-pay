import Image from 'next/image';
import React, { FC, useCallback, useMemo } from 'react';
import { useNavigateWithQuery } from '../../hooks/useNavigateWithQuery';
import { MERCHANT_IMAGE_PATH } from '../../utils/env';
import css from './Merchant.module.css';

export interface MerchantInfo {
    index: number;
    address: string;
    company: string;
    maxValue: number;
}

export interface MerchantProps {
    merchant: MerchantInfo;
}

export const Merchant: FC<MerchantProps> = ({ merchant }) => {
    const { index: id, address: recipient, company: label, maxValue } = merchant;
    const merchantImageSrc = MERCHANT_IMAGE_PATH + id + '.png';

    const navigate = useNavigateWithQuery();

    const select = useCallback(() => {
        navigate('/new?id=' + id + '&recipient=' + recipient + '&label=' + label + '&maxValue=' + maxValue);
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
