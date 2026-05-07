import { APP_NAME } from '@/core/constants';
import { cn } from '@/shared/utils/cn';
import { Clock, FolderOpen, Globe, Layers, Send, Settings } from 'lucide-react';

interface NavItem {
    id: string;
    icon: React.ElementType;
    label: string;
    active?: boolean;
    disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { id: 'request', icon: Send, label: 'Request', active: true },
    { id: 'collections', icon: FolderOpen, label: 'Collections', disabled: true },
    { id: 'environments', icon: Globe, label: 'Environments', disabled: true },
    { id: 'history', icon: Clock, label: 'History', disabled: true },
    { id: 'workspace', icon: Layers, label: 'Workspace', disabled: true },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
    { id: 'settings', icon: Settings, label: 'Settings', disabled: true },
];

function SidebarNav() {
    return (
        <nav className="flex flex-col items-center gap-1 w-full" aria-label="Module navigation">
            {NAV_ITEMS.map((item) => (
                <SidebarNavItem key={item.id} item={item} />
            ))}
        </nav>
    );
}

function SidebarNavItem({ item }: { item: NavItem }) {
    const Icon = item.icon;

    return (
        <button
            disabled={item.disabled}
            title={item.disabled ? `${item.label} — Coming soon` : item.label}
            aria-label={item.label}
            aria-current={item.active ? 'page' : undefined}
            className={cn(
                'group relative flex h-9 w-9 items-center justify-center rounded-(--radius) transition-[background-color,color] duration-(--transition-fast)',
                item.active
                    ? 'bg-(--color-surface-raised) text-(--color-text)'
                    : 'text-(--color-text-subtle) hover:bg-(--color-surface-hover) hover:text-muted-foreground',
                item.disabled &&
                    'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-(--color-text-subtle)'
            )}
        >
            <Icon className="h-4 w-4" strokeWidth={item.active ? 2 : 1.75} />
        </button>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <aside
                className="flex flex-col items-center gap-2 px-2 py-3 border-r border-(--color-border) w-13 shrink-0 bg-(--color-surface)"
                aria-label="Application sidebar"
            >
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-(--radius) shrink-0 mb-1"
                    aria-label={APP_NAME}
                    title={APP_NAME}
                >
                    <span className="text-(--color-primary) font-bold text-sm font-mono select-none">
                        R
                    </span>
                </div>

                <SidebarNav />

                <div className="mt-auto flex flex-col items-center gap-1">
                    {BOTTOM_NAV_ITEMS.map((item) => (
                        <SidebarNavItem key={item.id} item={item} />
                    ))}
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</main>
        </div>
    );
}
