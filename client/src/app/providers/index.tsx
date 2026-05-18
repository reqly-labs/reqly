import { AuthProvider } from '@/core/auth/AuthProvider';
import { SyncProvider } from '@/core/sync/SyncProvider';
import { ThemeProvider } from '@/shared/lib/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    <SyncProvider>{children}</SyncProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
