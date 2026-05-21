import { ThemeProvider } from '@/core/theme';
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>;
}
