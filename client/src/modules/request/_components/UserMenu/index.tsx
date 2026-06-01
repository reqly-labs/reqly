import { useAuth } from '@/core/auth';
import { Button } from '@/shared/components/ui/Button';
import { LogIn, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function UserMenu() {
    const { user, loading, signInWithGoogle, signOut } = useAuth();
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
        <Button
            variant="ghost"
            size="sm"
            onClick={signInWithGoogle}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-(--color-text)"
        >
            <LogIn className="h-3.5 w-3.5" />
            Sign in
        </Button>
    );
}
