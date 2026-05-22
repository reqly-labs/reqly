import { storageGet, storageSet } from '@/core/storage';
import { useEffect, useState } from 'react';
import { ThemeContext, type Theme } from './theme-context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        const stored = storageGet<Theme>('reqly:theme');
        if (stored === 'light' || stored === 'dark') {
            setTheme(stored);
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        root.classList.toggle('light', theme === 'light');
        storageSet('reqly:theme', theme);
    }, [theme]);

    const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

    return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
