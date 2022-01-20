import React, { FC, useEffect, useState } from 'react';
import { isFullscreen, toggleFullscreen } from '../utils/fullscreen';
import * as styles from './FullscreenButton.module.css';
import { Maximize } from './Maximize';
import { Minimize } from './Minimize';

export const FullscreenButton: FC = () => {
    const [fullscreen, setFullscreen] = useState(isFullscreen());

    useEffect(() => {
        const listener = () => setFullscreen(isFullscreen());
        document.addEventListener('fullscreenchange', listener);
        return () => document.removeEventListener('fullscreenchange', listener);
    }, []);

    return (
        <button className={styles.button} type="button" onClick={toggleFullscreen}>
            {fullscreen ? <Minimize /> : <Maximize />}
        </button>
    );
};
