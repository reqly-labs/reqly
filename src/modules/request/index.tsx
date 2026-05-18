import { APP_NAME } from '@/core/constants';
import { Button } from '@/shared/components/ui/button';
import { useTheme } from '@/shared/lib/theme';
import { Moon, PanelLeft, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { RequestPanel } from './components/RequestPanel';
import { ResponsePanel } from './components/ResponsePanel';
import { Sidebar } from './components/Sidebar';
import { TabBar } from './components/TabBar';
import { UrlBar } from './components/UrlBar';
import { _resetSkipCollectionSync, _skipCollectionSync, useRequestStore } from './store';
import { useCollectionsStore } from './store/collections';
import { useTabsStore } from './store/tabs';
import type { TabSnapshot } from './types';

function TopBar() {
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
                    src="https://arturbomtempo-dev.github.io/arturbomtempo-cdn/assets/images/projects/reqly/mascot.png"
                    alt={APP_NAME + ' mascot'}
                    className="h-6 w-6 object-contain select-none"
                    draggable={false}
                />
                <h1 className="text-md font-semibold tracking-tight text-(--color-text)">
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
        let prevMethod = useRequestStore.getState().method;
        let prevUrl = useRequestStore.getState().url;

        return useRequestStore.subscribe((state) => {
            const snapshot: TabSnapshot = {
                method: state.method,
                url: state.url,
                params: state.params,
                headers: state.headers,
                bodyType: state.bodyType,
                body: state.body,
                formBody: state.formBody,
                multipartBody: state.multipartBody,
                auth: state.auth,
                response: state.response,
            };
            useTabsStore.getState().syncActiveTab(snapshot);

            if (_skipCollectionSync) {
                _resetSkipCollectionSync();
                prevMethod = state.method;
                prevUrl = state.url;
                return;
            }

            const { tabs, activeTabId } = useTabsStore.getState();
            const activeTab = tabs.find((t) => t.id === activeTabId);

            if (activeTab?.savedRequestId && activeTab?.collectionId) {
                useCollectionsStore
                    .getState()
                    .updateRequest(activeTab.collectionId, activeTab.savedRequestId, snapshot);
            } else if ((state.method !== prevMethod || state.url !== prevUrl) && prevUrl.trim()) {
                useCollectionsStore
                    .getState()
                    .updateRequestByMethodUrl(prevMethod, prevUrl, snapshot);
            }

            prevMethod = state.method;
            prevUrl = state.url;
        });
    }, []);

    return (
        <div className="flex h-full min-h-0">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 min-h-0">
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
        </div>
    );
}
