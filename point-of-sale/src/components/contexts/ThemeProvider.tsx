import React, { FC, ReactNode, useLayoutEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Theme, ThemeContext } from '../../hooks/useTheme';

export interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

    useLayoutEffect(() => {
        if (window.matchMedia) {
            const query = '(prefers-color-scheme: dark)';

            if (!localStorage.getItem('theme')) {
                setTheme(window.matchMedia(query).matches ? 'dark' : 'light');
            }

            const listener = (event: MediaQueryListEventMap['change']) => setTheme(event.matches ? 'dark' : 'light');

            window.matchMedia(query).addEventListener('change', listener);
            return () => window.matchMedia(query).removeEventListener('change', listener);
        }
    }, [setTheme]);

    useLayoutEffect(() => {
        document.documentElement.classList.add(theme);
        return () => document.documentElement.classList.remove(theme);
    }, [theme]);

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
