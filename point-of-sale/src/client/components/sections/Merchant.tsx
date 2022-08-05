import Image from 'next/image';
import React, { FC, useCallback, useMemo } from 'react';
import { useNavigateWithQuery } from '../../hooks/useNavigateWithQuery';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
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
    const { index: id, company: label } = merchant;
    const merchantImageSrc = MERCHANT_IMAGE_PATH + id + '.png';

    return (
        <div className={css.body}>
            <div className={css.row}>
                <Image className={css.image} src={merchantImageSrc} alt="Merchant Logo" height={250} width={250} />
            </div>
            <div className={css.row}>
                <div className={css.label}>{label}</div>
            </div>
        </div>
    );
};
