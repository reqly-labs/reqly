import { AuthContext, useAuthState } from '@/core/auth';
import type { ReactNode } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
    const authState = useAuthState();
    return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
}
