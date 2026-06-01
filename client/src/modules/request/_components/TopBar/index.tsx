import { APP_NAME, MASCOT_URL } from '@/core/constants';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/lib/use-theme';
import { Moon, PanelLeft, Sun } from 'lucide-react';
import { useCollectionsStore } from '../../_store/collections';
import { UserMenu } from '../UserMenu';

export function TopBar() {
    const { theme, toggle } = useTheme();
    const { sidebarOpen, toggleSidebar } = useCollectionsStore();

    return (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-(--color-border) shrink-0 bg-(--color-surface-raised)/40">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                    className="h-8 w-8 text-muted-foreground hover:text-(--color-text)"
                >
                    <PanelLeft className="h-3.5 w-3.5" />
                </Button>
                <img
                    src={MASCOT_URL}
                    alt={APP_NAME + ' mascot'}
                    className="h-6 w-6 object-contain select-none"
                    draggable={false}
                />
                <h1 className="text-md font-semibold tracking-tight text-(--color-text)">
                    {APP_NAME}
                </h1>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggle}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    className="h-8 w-8 text-muted-foreground hover:text-(--color-text)"
                >
                    {theme === 'dark' ? (
                        <Sun className="h-3.5 w-3.5" />
                    ) : (
                        <Moon className="h-3.5 w-3.5" />
                    )}
                </Button>
                <UserMenu />
            </div>
        </div>
    );
}
