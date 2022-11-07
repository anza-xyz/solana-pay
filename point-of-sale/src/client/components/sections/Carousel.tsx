import React, { FC, ReactNode, useCallback, useMemo } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import { Merchant, MerchantInfo, MerchantProps } from './Merchant';
import css from './Carousel.module.css';
import { useNavigateWithQuery } from '../../hooks/useNavigateWithQuery';
import { useConfig } from '../../hooks/useConfig';

export interface MerchantsProps {
    merchants: MerchantInfo[];
}

export const MerchantCarousel: FC<MerchantsProps> = ({ merchants }) => {
    const { baseURL } = useConfig();
    const navigate = useNavigateWithQuery();
    const merchantList = useMemo(() => merchants, [merchants]);
    const onClickItem = useCallback((index: number, item: ReactNode) => {
        const { index: id, address: recipient, company: label, maxValue } = merchantList[index];
        const url = new URL(`${baseURL}/new`);
        url.searchParams.append('id', id.toString());
        url.searchParams.append('recipient', recipient.toString());
        url.searchParams.append('label', label.toString());
        url.searchParams.append('maxValue', maxValue.toString());
        navigate(url.toString());
    }, [baseURL, merchantList, navigate]);

    return (
        <Carousel
            className={css.body}
            infiniteLoop={true}
            showThumbs={false}
            statusFormatter={(c, t) => c + ' / ' + t}
            onClickItem={onClickItem}
        >
            {merchants.map((merchant) => (
                <Merchant key={merchant.index} index={merchant.index} company={merchant.company} />
            ))}
        </Carousel>
    );
};
