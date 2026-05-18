import type { User } from 'firebase/auth';
import {
    signOut as firebaseSignOut,
    GithubAuthProvider,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';

export interface AuthState {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithGitHub: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState>({
    user: null,
    loading: true,
    signInWithGoogle: async () => {},
    signInWithGitHub: async () => {},
    signOut: async () => {},
});

export function useAuth(): AuthState {
    return useContext(AuthContext);
}

export function useAuthState() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signInWithGitHub = async () => {
        const provider = new GithubAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    return { user, loading, signInWithGoogle, signInWithGitHub, signOut };
}
