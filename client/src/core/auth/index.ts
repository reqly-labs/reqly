import { createContext, useContext, useEffect, useState } from 'react';
import { storageGet, storageRemove, storageSet } from '../storage';

const API_URL = import.meta.env.VITE_API_URL as string;

if (!API_URL) {
    throw new Error('VITE_API_URL is not defined. Check your .env file.');
}

const TOKEN_KEY = 'reqly:token';

export interface AuthUser {
    uid: string;
    email: string;
    name: string;
    picture: string | null;
    provider: string;
}

export interface AuthState {
    user: AuthUser | null;
    loading: boolean;
    signInWithGoogle: () => void;
    signOut: () => void;
}

export const AuthContext = createContext<AuthState>({
    user: null,
    loading: true,
    signInWithGoogle: () => {},
    signOut: () => {},
});

export function useAuth(): AuthState {
    return useContext(AuthContext);
}

export function getToken(): string | null {
    return storageGet<string>(TOKEN_KEY);
}

export function useAuthState() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then((data: { user: AuthUser }) => setUser(data.user))
            .catch(() => {
                storageRemove(TOKEN_KEY);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.origin !== new URL(API_URL).origin) return;

            const data = event.data as { type?: string; token?: string; user?: AuthUser };

            if (data.type === 'auth-success' && data.token && data.user) {
                storageSet(TOKEN_KEY, data.token);
                setUser(data.user);
            }
        };

        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    const signInWithGoogle = () => {
        window.open(`${API_URL}/auth/google`, 'auth', 'popup,width=500,height=600');
    };

    const signOut = () => {
        storageRemove(TOKEN_KEY);
        setUser(null);
    };

    return { user, loading, signInWithGoogle, signOut };
}
