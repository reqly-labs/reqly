import { cn } from '@/shared/utils/cn';
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRequestStore } from '../../../_store';
import { useCollectionsStore } from '../../../_store/collections';
import { useTabsStore } from '../../../_store/tabs';
import type { Tab } from '../../../_types';
import { MethodBadge } from '../../MethodBadge';
import { ContextMenu } from '../ContextMenu';
import { drag } from '../drag';
import { InlineEdit } from '../InlineEdit';
import { captureSnapshot, tabLabel } from '../utils';

export function TabItem({ tab, isActive }: { tab: Tab; isActive: boolean }) {
    const { initFromSnapshot } = useRequestStore();
    const { setActiveTab, syncActiveTab, renameTab, closeTab } = useTabsStore();
    const [editing, setEditing] = useState(false);
    const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

    const handleClick = () => {
        if (isActive || editing) return;
        const snapshot = captureSnapshot();
        syncActiveTab(snapshot);
        const freshTab = useTabsStore.getState().tabs.find((t) => t.id === tab.id);
        if (freshTab) {
            setActiveTab(tab.id);
            initFromSnapshot(freshTab.snapshot);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setMenu({ x: e.clientX, y: e.clientY });
    };

    const handleDragStart = (e: React.DragEvent) => {
        drag.current = { type: 'tab', tabId: tab.id };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tab.id);
    };

    const handleDragEnd = () => {
        drag.current = null;
    };

    const handleClose = () => {
        if (tab.id === useTabsStore.getState().activeTabId) {
            syncActiveTab(captureSnapshot());
        }
        const newActiveId = closeTab(tab.id);
        if (newActiveId) {
            const newActive = useTabsStore.getState().tabs.find((t) => t.id === newActiveId);
            if (newActive) initFromSnapshot(newActive.snapshot);
        }
    };

    return (
        <>
            <div
                onClick={handleClick}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditing(true);
                }}
                onContextMenu={handleContextMenu}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className={cn(
                    'group flex items-center gap-2 px-2 py-1 cursor-pointer rounded-sm transition-colors',
                    isActive
                        ? 'bg-(--color-surface-hover) text-(--color-text)'
                        : 'hover:bg-(--color-surface-hover)'
                )}
            >
                <GripVertical className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-40 cursor-grab text-muted-foreground" />
                <MethodBadge method={tab.snapshot.method} className="text-[9px] shrink-0" />
                {editing ? (
                    <InlineEdit
                        value={tab.name || tabLabel(tab)}
                        onCommit={(name) => {
                            renameTab(tab.id, name);
                            if (name.trim() && tab.savedRequestId && tab.collectionId) {
                                useCollectionsStore
                                    .getState()
                                    .renameRequest(tab.collectionId, tab.savedRequestId, name);
                            }
                            setEditing(false);
                        }}
                        onCancel={() => setEditing(false)}
                    />
                ) : (
                    <span
                        className={cn(
                            'text-xs truncate min-w-0 transition-colors',
                            isActive
                                ? 'text-(--color-text)'
                                : 'text-(--color-text-subtle) group-hover:text-(--color-text)'
                        )}
                    >
                        {tabLabel(tab)}
                    </span>
                )}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenu({ x: rect.right, y: rect.bottom });
                    }}
                    className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-(--color-text) transition-all"
                >
                    <MoreHorizontal className="h-3 w-3" />
                </button>
            </div>
            {menu && (
                <ContextMenu
                    position={menu}
                    onClose={() => setMenu(null)}
                    items={[
                        {
                            label: 'Rename',
                            icon: Pencil,
                            onClick: () => setEditing(true),
                        },
                        {
                            label: 'Close',
                            icon: Trash2,
                            onClick: handleClose,
                            destructive: true,
                        },
                    ]}
                />
            )}
        </>
    );
}
