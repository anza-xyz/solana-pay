import React, { FC, ReactNode, useEffect, useState, createContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextState {
    theme: Theme;
    setTheme(theme: Theme): void;
}

export const ThemeContext = createContext<ThemeContextState>({} as ThemeContextState);

export const ThemeProvider: FC<{
    children: ReactNode;
}> = ({ children }) => {
    const query = '(prefers-color-scheme: light)';
    const [theme, setTheme] = useState<Theme>(() =>
        typeof window !== 'undefined' && window.matchMedia && window.matchMedia(query).matches ? 'light' : 'dark'
    );

    useEffect(() => {
        if (window.matchMedia) {
            const listener = (event: MediaQueryListEventMap['change']) => setTheme(event.matches ? 'light' : 'dark');

            window.matchMedia(query).addEventListener('change', listener);
            return () => window.matchMedia(query).removeEventListener('change', listener);
        }
    }, []);

    useEffect(() => {
        document.documentElement.classList.add(theme);
        document.documentElement.style.visibility = 'visible';
        return () => document.documentElement.classList.remove(theme);
    }, [theme]);

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
