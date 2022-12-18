import React, { FC, ReactNode, useCallback } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import { Merchant, MerchantInfo } from './Merchant';
import css from './Carousel.module.css';
import { useNavigateWithQuery } from '../../hooks/useNavigateWithQuery';
import { createURLWithParams } from "../../utils/createURLWithQuery";

export interface MerchantsProps {
    merchants: MerchantInfo[];
    id?: number;
}

export const MerchantCarousel: FC<MerchantsProps> = ({ merchants, id }) => {
    const navigate = useNavigateWithQuery();
    const onClickItem = useCallback((index: number, item: ReactNode) => {
        const { index: id, address: recipient, company: label, maxValue } = merchants[index];
        const urlParams = new URLSearchParams();
        urlParams.append('id', id.toString());
        urlParams.append('recipient', recipient.toString());
        urlParams.append('label', label.toString());
        urlParams.append('maxValue', maxValue.toString());
        const url = createURLWithParams("new", urlParams);
        navigate(url.toString());
    }, [merchants, navigate]);
    const selectedItem = id && merchants.length > 0 ? parseInt(id.toString()) - merchants[0].index : 0;

    return (
        <Carousel
            className={css.body}
            infiniteLoop={true}
            showThumbs={false}
            statusFormatter={(c, t) => c + ' / ' + t}
            onClickItem={onClickItem}
            selectedItem={selectedItem}
        >
            {merchants.map((merchant) => (
                <Merchant key={merchant.index} index={merchant.index} company={merchant.company} />
            ))}
        </Carousel>
    );
};
