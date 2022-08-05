import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import { Merchant, MerchantInfo, MerchantProps } from './Merchant';
import css from './Carousel.module.css';
import { useNavigateWithQuery } from '../../hooks/useNavigateWithQuery';

export interface MerchantsProps {
    merchants: MerchantInfo[];
}

export const MerchantCarousel: FC<MerchantsProps> = ({ merchants }) => {
    const navigate = useNavigateWithQuery();
    const merchantList = useMemo(() => merchants, []);
    const onClickItem = (index: number, item: ReactNode) => {
        const { index: id, address: recipient, company: label, maxValue } = merchantList[index];
        navigate('/new?id=' + id + '&recipient=' + recipient + '&label=' + label + '&maxValue=' + maxValue);
    };

    return (
        <Carousel
            className={css.body}
            infiniteLoop={true}
            showThumbs={false}
            statusFormatter={(c, t) => c + ' / ' + t}
            onClickItem={onClickItem}
        >
            {merchants.map((merchant) => (
                <Merchant merchant={merchant} />
            ))}
        </Carousel>
    );
};
