import React, { createContext, FC, ReactNode, useContext, useLayoutEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type Theme = 'light' | 'dark';

export interface ThemeContextState {
    theme: Theme;
    setTheme(theme: Theme): void;
}

export const ThemeContext = createContext<ThemeContextState>({} as ThemeContextState);

export function useTheme(): ThemeContextState {
    return useContext(ThemeContext);
}

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
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
    }, [theme]);

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
