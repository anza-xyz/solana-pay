import React, { createContext, FC, ReactNode, useContext } from 'react';
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

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
