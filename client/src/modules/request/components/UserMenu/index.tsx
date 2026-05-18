import { useAuth } from '@/core/auth';
import { Button } from '@/shared/components/ui/button';
import { Github, LogIn, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function UserMenu() {
    const { user, loading, signInWithGoogle, signInWithGitHub, signOut } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    if (loading) return null;

    const handleGoogle = () => {
        signInWithGoogle();
        setOpen(false);
    };

    const handleGitHub = () => {
        signInWithGitHub();
        setOpen(false);
    };

    if (user) {
        return (
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setOpen((o) => !o)}
                    className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-(--color-border) hover:ring-(--color-text)/40 transition-all cursor-pointer"
                    aria-label="User menu"
                >
                    <img
                        src={user.picture ?? undefined}
                        alt={user.name ?? 'User'}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                </button>

                {open && (
                    <div className="absolute right-0 top-full mt-1.5 w-52 rounded-lg border border-(--color-border) bg-(--color-surface-raised) shadow-lg py-1 z-50">
                        <div className="px-3 py-2 border-b border-(--color-border)">
                            <p className="text-xs font-medium text-(--color-text) truncate">
                                {user.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                                {user.email}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                signOut();
                                setOpen(false);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-(--color-text) hover:bg-(--color-surface)/60 transition-colors cursor-pointer"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign out
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen((o) => !o)}
                aria-label="Sign in"
                className="h-8 w-8 text-muted-foreground hover:text-(--color-text)"
            >
                <LogIn className="h-3.5 w-3.5" />
            </Button>

            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-48 rounded-lg border border-(--color-border) bg-(--color-surface-raised) shadow-lg py-1 z-50">
                    <p className="px-3 py-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        Sign in to sync
                    </p>
                    <button
                        onClick={handleGoogle}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-(--color-text) hover:bg-(--color-surface)/60 transition-colors cursor-pointer"
                    >
                        <GoogleIcon className="h-3.5 w-3.5" />
                        Continue with Google
                    </button>
                    <button
                        onClick={handleGitHub}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-(--color-text) hover:bg-(--color-surface)/60 transition-colors cursor-pointer"
                    >
                        <Github className="h-3.5 w-3.5" />
                        Continue with GitHub
                    </button>
                </div>
            )}
        </div>
    );
}

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}
