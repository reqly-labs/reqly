import { APP_NAME } from '@/core/constants';
import { Button } from '@/shared/components/ui/button';
import { useTheme } from '@/shared/lib/theme';
import { Moon, Sun } from 'lucide-react';
import { RequestPanel } from './components/RequestPanel';
import { ResponsePanel } from './components/ResponsePanel';
import { UrlBar } from './components/UrlBar';

function TopBar() {
    const { theme, toggle } = useTheme();

    return (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-(--color-border) shrink-0">
            <h1 className="text-sm font-semibold tracking-tight text-(--color-text)">{APP_NAME}</h1>
            <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="h-7 w-7 text-muted-foreground hover:text-(--color-text)"
            >
                {theme === 'dark' ? (
                    <Sun className="h-3.5 w-3.5" />
                ) : (
                    <Moon className="h-3.5 w-3.5" />
                )}
            </Button>
        </div>
    );
}

export function RequestModule() {
    return (
        <div className="flex flex-col h-full min-h-0">
            <TopBar />
            <div className="flex-1 flex flex-col gap-3 p-4 min-h-0 overflow-hidden">
                <UrlBar />
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
                    <RequestPanel />
                    <ResponsePanel />
                </div>
            </div>
        </div>
    );
}
