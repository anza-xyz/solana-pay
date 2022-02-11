import React, { FC, ReactNode, useLayoutEffect, useState } from 'react';
import { FullscreenContext } from '../../hooks/useFullscreen';
import { isFullscreen, toggleFullscreen } from '../../utils/fullscreen';

export interface FullscreenProviderProps {
    children: ReactNode;
}

export const FullscreenProvider: FC<FullscreenProviderProps> = ({ children }) => {
    const [fullscreen, setFullscreen] = useState(isFullscreen());

    useLayoutEffect(() => setFullscreen(isFullscreen()), []);

    useLayoutEffect(() => {
        const listener = () => setFullscreen(isFullscreen());
        document.addEventListener('fullscreenchange', listener);
        document.addEventListener('webkitfullscreenchange', listener);
        return () => {
            document.removeEventListener('fullscreenchange', listener);
            document.removeEventListener('webkitfullscreenchange', listener);
        };
    }, []);

    useLayoutEffect(() => {
        if (fullscreen) {
            document.documentElement.classList.add('fullscreen');
            return () => document.documentElement.classList.remove('fullscreen');
        }
    }, [fullscreen]);

    return <FullscreenContext.Provider value={{ fullscreen, toggleFullscreen }}>{children}</FullscreenContext.Provider>;
};
