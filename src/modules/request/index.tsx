import { APP_NAME } from '@/core/constants';
import { Button } from '@/shared/components/ui/button';
import { useTheme } from '@/shared/lib/theme';
import { Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { RequestPanel } from './components/RequestPanel';
import { ResponsePanel } from './components/ResponsePanel';
import { TabBar } from './components/TabBar';
import { UrlBar } from './components/UrlBar';
import { useRequestStore } from './store';
import { useTabsStore } from './store/tabs';
import type { TabSnapshot } from './types';

function TopBar() {
    const { theme, toggle } = useTheme();

    return (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-(--color-border) shrink-0 bg-(--color-surface-raised)/40">
            <div className="flex items-center gap-2">
                <img
                    src="https://arturbomtempo-dev.github.io/arturbomtempo-cdn/assets/images/projects/reqly/mascot.png"
                    alt={APP_NAME + ' mascot'}
                    className="h-7 w-7 object-contain select-none"
                    draggable={false}
                />
                <h1 className="text-lg font-semibold tracking-tight text-(--color-text)">
                    {APP_NAME}
                </h1>
            </div>
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
        </div>
    );
}

export function RequestModule() {
    useEffect(() => {
        return useRequestStore.subscribe((state) => {
            const snapshot: TabSnapshot = {
                method: state.method,
                url: state.url,
                params: state.params,
                headers: state.headers,
                bodyType: state.bodyType,
                body: state.body,
                formBody: state.formBody,
                auth: state.auth,
                response: state.response,
            };
            useTabsStore.getState().syncActiveTab(snapshot);
        });
    }, []);

    return (
        <div className="flex flex-col h-full min-h-0">
            <TopBar />
            <TabBar />
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
