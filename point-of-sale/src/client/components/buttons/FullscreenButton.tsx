import React, { FC } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { MaximizeIcon } from '../images/MaximizeIcon';
import { MinimizeIcon } from '../images/MinimizeIcon';
import css from './FullscreenButton.module.css';

export const FullscreenButton: FC = () => {
    const { fullscreen, toggleFullscreen } = useFullscreen();
    const isMerchantPOS = Boolean(process.env.NEXT_PUBLIC_IS_MERCHANT_POS) || false;

    return isMerchantPOS ? (
        <button className={css.button} type="button" onClick={toggleFullscreen}>
            {fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
        </button>
    ) : null;
};
