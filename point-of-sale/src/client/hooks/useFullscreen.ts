import { useContext } from 'react';
import { FullscreenContext, FullscreenContextState } from '../components/contexts/FullscreenProvider';

export function useFullscreen(): FullscreenContextState {
    return useContext(FullscreenContext);
}
