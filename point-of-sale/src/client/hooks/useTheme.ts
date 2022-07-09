import { useContext } from 'react';
import { ThemeContext, ThemeContextState } from '../components/contexts/ThemeProvider';

export function useTheme(): ThemeContextState {
    return useContext(ThemeContext);
}
