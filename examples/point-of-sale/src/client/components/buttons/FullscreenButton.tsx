import React, { FC } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { MaximizeIcon } from '../images/MaximizeIcon';
import { MinimizeIcon } from '../images/MinimizeIcon';
import css from './FullscreenButton.module.css';
import { IS_CUSTOMER_POS } from '../../utils/env';

export const FullscreenButton: FC = () => {
    const { fullscreen, toggleFullscreen } = useFullscreen();

    return !IS_CUSTOMER_POS ? (
        <button className={css.button} type="button" onClick={toggleFullscreen}>
            {fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
        </button>
    ) : null;
};
