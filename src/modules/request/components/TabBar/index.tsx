import { cn } from '@/shared/utils/cn';
import { Plus, X } from 'lucide-react';
import { useRequestStore } from '../../store';
import { useTabsStore } from '../../store/tabs';
import type { Tab, TabSnapshot } from '../../types';
import { MethodBadge } from '../MethodBadge';

function tabLabel(tab: Tab): string {
    const url = tab.snapshot.url.trim();
    if (!url) return 'New Request';
    try {
        const parsed = new URL(url);
        return parsed.pathname === '/' ? parsed.hostname : parsed.pathname;
    } catch {
        return url.length > 22 ? url.slice(0, 22) + '…' : url;
    }
}

function captureSnapshot(): TabSnapshot {
    const { method, url, params, headers, bodyType, body, formBody, response } =
        useRequestStore.getState();
    return { method, url, params, headers, bodyType, body, formBody, response };
}

export function TabBar() {
    const { tabs, activeTabId, addTab, closeTab, setActiveTab, syncActiveTab } = useTabsStore();
    const { initFromSnapshot } = useRequestStore();

    const handleTabClick = (id: string) => {
        if (id === activeTabId) return;
        syncActiveTab(captureSnapshot());
        const target = tabs.find((t) => t.id === id);
        if (target) {
            setActiveTab(id);
            initFromSnapshot(target.snapshot);
        }
    };

    const handleAdd = () => {
        syncActiveTab(captureSnapshot());
        const newId = addTab();
        const newTab = useTabsStore.getState().tabs.find((t) => t.id === newId);
        if (newTab) initFromSnapshot(newTab.snapshot);
    };

    const handleClose = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (id === activeTabId) syncActiveTab(captureSnapshot());
        const newActiveId = closeTab(id);
        if (newActiveId) {
            const newActive = useTabsStore.getState().tabs.find((t) => t.id === newActiveId);
            if (newActive) initFromSnapshot(newActive.snapshot);
        }
    };

    return (
        <div className="flex items-center border-b border-(--color-border) bg-(--color-surface-raised)/40 px-2 shrink-0 overflow-x-auto">
            {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                    <div
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={cn(
                            'group flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer shrink-0 border-b-2 transition-colors duration-(--transition-fast) select-none max-w-44',
                            isActive
                                ? 'border-b-(--color-primary) text-(--color-text)'
                                : 'border-b-transparent text-muted-foreground hover:text-(--color-text) hover:bg-(--color-surface-hover)'
                        )}
                    >
                        <MethodBadge method={tab.snapshot.method} className="text-[10px]" />
                        <span className="truncate min-w-0">{tabLabel(tab)}</span>
                        {tabs.length > 1 && (
                            <button
                                onClick={(e) => handleClose(e, tab.id)}
                                className={cn(
                                    'ml-auto shrink-0 rounded p-0.5 transition-colors duration-(--transition-fast)',
                                    'opacity-0 group-hover:opacity-100',
                                    isActive && 'opacity-60',
                                    'hover:opacity-100 hover:bg-(--color-surface-raised) text-muted-foreground hover:text-(--color-text)'
                                )}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                );
            })}
            <button
                onClick={handleAdd}
                className="shrink-0 p-2 text-muted-foreground hover:text-(--color-text) transition-colors duration-(--transition-fast)"
                aria-label="New tab"
            >
                <Plus className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
