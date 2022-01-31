import React, { FC, useEffect, useState } from 'react';
import { isFullscreen, toggleFullscreen } from '../../utils/fullscreen';
import { MaximizeIcon } from '../images/MaximizeIcon';
import { MinimizeIcon } from '../images/MinimizeIcon';
import * as css from './FullscreenButton.module.pcss';

export const FullscreenButton: FC = () => {
    const [fullscreen, setFullscreen] = useState(isFullscreen());

    useEffect(() => {
        const listener = () => setFullscreen(isFullscreen());
        document.addEventListener('fullscreenchange', listener);
        return () => document.removeEventListener('fullscreenchange', listener);
    }, []);

    return (
        <button className={css.button} type="button" onClick={toggleFullscreen}>
            {fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
        </button>
    );
};
