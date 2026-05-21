import { AuthProvider } from '@/core/auth/AuthProvider';
import { SyncProvider } from '@/core/sync/SyncProvider';
import { ThemeProvider } from '@/shared/lib/theme';

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <SyncProvider>{children}</SyncProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
