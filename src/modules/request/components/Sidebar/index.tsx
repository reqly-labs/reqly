import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils/cn';
import {
    ChevronRight,
    Clock,
    FolderOpen,
    FolderPlus,
    GripVertical,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRequestStore } from '../../store';
import { useCollectionsStore } from '../../store/collections';
import { useTabsStore } from '../../store/tabs';
import type { Collection, SavedRequest, Tab, TabSnapshot } from '../../types';
import { MethodBadge } from '../MethodBadge';

interface DragPayload {
    type: 'tab' | 'request';
    tabId?: string;
    requestId?: string;
    sourceCollectionId?: string;
}

let currentDrag: DragPayload | null = null;

function captureSnapshot(): TabSnapshot {
    const { method, url, params, headers, bodyType, body, formBody, auth, response } =
        useRequestStore.getState();
    return { method, url, params, headers, bodyType, body, formBody, auth, response };
}

function requestLabel(req: SavedRequest): string {
    if (req.name) return req.name;
    const url = req.snapshot.url.trim();
    if (!url) return 'New Request';
    try {
        const parsed = new URL(url);
        return parsed.pathname === '/' ? parsed.hostname : parsed.pathname;
    } catch {
        return url.length > 20 ? url.slice(0, 20) + '…' : url;
    }
}

function tabLabel(tab: Tab): string {
    if (tab.name) return tab.name;
    const url = tab.snapshot.url.trim();
    if (!url) return 'New Request';
    try {
        const parsed = new URL(url);
        return parsed.pathname === '/' ? parsed.hostname : parsed.pathname;
    } catch {
        return url.length > 20 ? url.slice(0, 20) + '…' : url;
    }
}

function ContextMenu({
    items,
    position,
    onClose,
}: {
    items: {
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        onClick: () => void;
        destructive?: boolean;
    }[];
    position: { x: number; y: number };
    onClose: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="fixed z-50 min-w-40 rounded-md border border-(--color-border) bg-popover text-popover-foreground shadow-md py-1 animate-in fade-in-0 zoom-in-95"
            style={{ top: position.y, left: position.x }}
        >
            {items.map((item) => (
                <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                        item.onClick();
                        onClose();
                    }}
                    className={cn(
                        'flex w-full items-center gap-2.5 px-3 py-1.5 text-xs transition-colors cursor-pointer',
                        item.destructive
                            ? 'text-destructive hover:bg-destructive/10'
                            : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                </button>
            ))}
        </div>
    );
}

function InlineEdit({
    value,
    onCommit,
    onCancel,
    className,
}: {
    value: string;
    onCommit: (value: string) => void;
    onCancel: () => void;
    className?: string;
}) {
    const [text, setText] = useState(value);
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        ref.current?.select();
    }, []);

    const commit = () => {
        if (text.trim()) onCommit(text.trim());
        else onCancel();
    };

    return (
        <input
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') onCancel();
                e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
                'min-w-0 w-full bg-transparent outline-none border-b border-(--color-primary) text-xs text-(--color-text)',
                className
            )}
        />
    );
}

function RequestItem({ req, collectionId }: { req: SavedRequest; collectionId: string }) {
    const { renameRequest, removeRequest } = useCollectionsStore();
    const { initFromSnapshot } = useRequestStore();
    const { addTab, syncActiveTab, setActiveTab } = useTabsStore();
    const [editing, setEditing] = useState(false);
    const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

    const openRequest = () => {
        if (editing) return;
        const { tabs, activeTabId } = useTabsStore.getState();
        const existing = tabs.find(
            (t) =>
                t.snapshot.method === req.snapshot.method &&
                t.snapshot.url.trim() === req.snapshot.url.trim()
        );
        if (existing) {
            if (existing.id !== activeTabId) {
                syncActiveTab(captureSnapshot());
                setActiveTab(existing.id);
                initFromSnapshot(existing.snapshot);
            }
            return;
        }
        const snapshot = captureSnapshot();
        syncActiveTab(snapshot);
        const newId = addTab();
        const newTab = useTabsStore.getState().tabs.find((t) => t.id === newId);
        if (newTab) {
            const reqSnapshot = {
                ...req.snapshot,
                auth: req.snapshot.auth ?? { type: 'none' as const },
            };
            initFromSnapshot(reqSnapshot);
            useTabsStore.getState().syncActiveTab(reqSnapshot);
            useTabsStore.getState().renameTab(newId, req.name);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setMenu({ x: e.clientX, y: e.clientY });
    };

    const handleDragStart = (e: React.DragEvent) => {
        currentDrag = { type: 'request', requestId: req.id, sourceCollectionId: collectionId };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', req.id);
    };

    const handleDragEnd = () => {
        currentDrag = null;
    };

    return (
        <>
            <div
                onClick={openRequest}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditing(true);
                }}
                onContextMenu={handleContextMenu}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className="group flex items-center gap-2 pl-3 pr-2 py-1 cursor-pointer hover:bg-(--color-surface-hover) rounded-sm transition-colors"
            >
                <GripVertical className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-40 cursor-grab text-muted-foreground" />
                <MethodBadge method={req.snapshot.method} className="text-[9px] shrink-0" />
                {editing ? (
                    <InlineEdit
                        value={req.name}
                        onCommit={(name) => {
                            renameRequest(collectionId, req.id, name);
                            if (name.trim()) {
                                useTabsStore
                                    .getState()
                                    .renameTabByMethodUrl(
                                        req.snapshot.method,
                                        req.snapshot.url,
                                        name
                                    );
                            }
                            setEditing(false);
                        }}
                        onCancel={() => setEditing(false)}
                    />
                ) : (
                    <span className="text-xs truncate min-w-0 text-(--color-text-subtle) group-hover:text-(--color-text) transition-colors">
                        {requestLabel(req)}
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
                            label: 'Delete',
                            icon: Trash2,
                            onClick: () => removeRequest(collectionId, req.id),
                            destructive: true,
                        },
                    ]}
                />
            )}
        </>
    );
}

function CollectionItem({ collection }: { collection: Collection }) {
    const {
        expandedIds,
        toggleExpanded,
        renameCollection,
        removeCollection,
        addRequest,
        moveRequest,
    } = useCollectionsStore();

    const expanded = expandedIds.includes(collection.id);
    const [editing, setEditing] = useState(false);
    const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleSaveCurrentRequest = () => {
        const snapshot = captureSnapshot();
        const url = snapshot.url.trim();
        let name = 'New Request';
        if (url) {
            try {
                const parsed = new URL(url);
                name = parsed.pathname === '/' ? parsed.hostname : parsed.pathname;
            } catch {
                name = url.length > 24 ? url.slice(0, 24) + '…' : url;
            }
        }
        addRequest(collection.id, name, snapshot);
        if (!expanded) toggleExpanded(collection.id);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setMenu({ x: e.clientX, y: e.clientY });
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!currentDrag) return;
        if (currentDrag.type === 'request' && currentDrag.sourceCollectionId === collection.id)
            return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (!currentDrag) return;

        if (currentDrag.type === 'tab' && currentDrag.tabId) {
            const tab = useTabsStore.getState().tabs.find((t) => t.id === currentDrag!.tabId);
            if (tab) {
                const snapshot =
                    tab.id === useTabsStore.getState().activeTabId
                        ? captureSnapshot()
                        : tab.snapshot;
                const url = snapshot.url.trim();
                let name = tab.name || 'New Request';
                if (!tab.name && url) {
                    try {
                        const parsed = new URL(url);
                        name = parsed.pathname === '/' ? parsed.hostname : parsed.pathname;
                    } catch {
                        name = url.length > 24 ? url.slice(0, 24) + '…' : url;
                    }
                }
                addRequest(collection.id, name, snapshot);
                if (!expanded) toggleExpanded(collection.id);
            }
        } else if (
            currentDrag.type === 'request' &&
            currentDrag.requestId &&
            currentDrag.sourceCollectionId
        ) {
            moveRequest(currentDrag.sourceCollectionId, collection.id, currentDrag.requestId);
            if (!expanded) toggleExpanded(collection.id);
        }

        currentDrag = null;
    };

    return (
        <div>
            <div
                onClick={() => toggleExpanded(collection.id)}
                onContextMenu={handleContextMenu}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'group flex items-center gap-1.5 px-2 py-1.5 cursor-pointer hover:bg-(--color-surface-hover) rounded-sm transition-colors',
                    dragOver && 'ring-2 ring-(--color-primary)/50 bg-(--color-primary)/5'
                )}
            >
                <ChevronRight
                    className={cn(
                        'h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-150',
                        expanded && 'rotate-90'
                    )}
                />
                <FolderOpen className="h-3.5 w-3.5 shrink-0 text-(--color-primary)/70" />
                {editing ? (
                    <InlineEdit
                        value={collection.name}
                        onCommit={(name) => {
                            renameCollection(collection.id, name);
                            setEditing(false);
                        }}
                        onCancel={() => setEditing(false)}
                    />
                ) : (
                    <span className="text-xs font-medium truncate min-w-0 text-(--color-text)">
                        {collection.name}
                    </span>
                )}
                <span className="ml-auto text-[10px] font-mono text-muted-foreground tabular-nums shrink-0">
                    {collection.requests.length}
                </span>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenu({ x: rect.right, y: rect.bottom });
                    }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-(--color-text) transition-all"
                >
                    <MoreHorizontal className="h-3 w-3" />
                </button>
            </div>

            {expanded && (
                <div className="ml-1">
                    {collection.requests.length === 0 && (
                        <p className="pl-7 py-2 text-[11px] text-(--color-text-subtle)">
                            No requests yet
                        </p>
                    )}
                    {collection.requests.map((req) => (
                        <RequestItem key={req.id} req={req} collectionId={collection.id} />
                    ))}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSaveCurrentRequest();
                        }}
                        className="flex items-center gap-1.5 pl-7 pr-2 py-1 w-full text-[11px] text-muted-foreground hover:text-(--color-text) transition-colors cursor-pointer"
                    >
                        <Plus className="h-3 w-3" />
                        Save current request
                    </button>
                </div>
            )}

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
                            label: 'Save current request here',
                            icon: Plus,
                            onClick: handleSaveCurrentRequest,
                        },
                        {
                            label: 'Delete collection',
                            icon: Trash2,
                            onClick: () => removeCollection(collection.id),
                            destructive: true,
                        },
                    ]}
                />
            )}
        </div>
    );
}

function NewCollectionInput({ onDone }: { onDone: () => void }) {
    const { addCollection } = useCollectionsStore();
    const [name, setName] = useState('');
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    const commit = () => {
        if (name.trim()) addCollection(name.trim());
        onDone();
    };

    return (
        <div className="flex items-center gap-1.5 px-2 py-1">
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-(--color-primary)/70" />
            <Input
                ref={ref}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') commit();
                    if (e.key === 'Escape') onDone();
                }}
                placeholder="Collection name"
                className="h-6 text-xs border-0 border-b border-(--color-primary) rounded-none bg-transparent shadow-none focus-visible:ring-0 px-0"
            />
        </div>
    );
}

function TabItem({ tab, isActive }: { tab: Tab; isActive: boolean }) {
    const { initFromSnapshot } = useRequestStore();
    const { setActiveTab, syncActiveTab, renameTab, closeTab } = useTabsStore();
    const [editing, setEditing] = useState(false);
    const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

    const handleClick = () => {
        if (isActive || editing) return;
        const snapshot = captureSnapshot();
        syncActiveTab(snapshot);
        setActiveTab(tab.id);
        initFromSnapshot(tab.snapshot);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setMenu({ x: e.clientX, y: e.clientY });
    };

    const handleDragStart = (e: React.DragEvent) => {
        currentDrag = { type: 'tab', tabId: tab.id };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tab.id);
    };

    const handleDragEnd = () => {
        currentDrag = null;
    };

    const handleClose = () => {
        const tabs = useTabsStore.getState().tabs;
        if (tabs.length <= 1) return;
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
                            if (name.trim()) {
                                useCollectionsStore
                                    .getState()
                                    .renameRequestByMethodUrl(
                                        tab.snapshot.method,
                                        tab.snapshot.url,
                                        name
                                    );
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
                        ...(useTabsStore.getState().tabs.length > 1
                            ? [
                                  {
                                      label: 'Close',
                                      icon: Trash2,
                                      onClick: handleClose,
                                      destructive: true,
                                  },
                              ]
                            : []),
                    ]}
                />
            )}
        </>
    );
}

function RecentSection() {
    const { tabs, activeTabId } = useTabsStore();
    const { removeRequest } = useCollectionsStore();
    const { initFromSnapshot } = useRequestStore();
    const { addTab, syncActiveTab } = useTabsStore();
    const [expanded, setExpanded] = useState(true);
    const [dragOver, setDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        if (!currentDrag || currentDrag.type !== 'request') return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (!currentDrag || currentDrag.type !== 'request') return;
        if (!currentDrag.requestId || !currentDrag.sourceCollectionId) return;

        const collection = useCollectionsStore
            .getState()
            .collections.find((c) => c.id === currentDrag!.sourceCollectionId);
        const req = collection?.requests.find((r) => r.id === currentDrag!.requestId);

        if (req) {
            const { tabs, activeTabId } = useTabsStore.getState();
            const existing = tabs.find(
                (t) =>
                    t.snapshot.method === req.snapshot.method &&
                    t.snapshot.url.trim() === req.snapshot.url.trim()
            );
            if (existing) {
                if (existing.id !== activeTabId) {
                    syncActiveTab(captureSnapshot());
                    useTabsStore.getState().setActiveTab(existing.id);
                    initFromSnapshot(existing.snapshot);
                }
            } else {
                const snapshot = captureSnapshot();
                syncActiveTab(snapshot);
                const newId = addTab();
                const newTab = useTabsStore.getState().tabs.find((t) => t.id === newId);
                if (newTab) {
                    const reqSnapshot = {
                        ...req.snapshot,
                        auth: req.snapshot.auth ?? { type: 'none' as const },
                    };
                    initFromSnapshot(reqSnapshot);
                    useTabsStore.getState().syncActiveTab(reqSnapshot);
                    useTabsStore.getState().renameTab(newId, req.name);
                }
            }
            removeRequest(currentDrag.sourceCollectionId, currentDrag.requestId);
        }

        currentDrag = null;
    };

    return (
        <div>
            <div
                onClick={() => setExpanded((v) => !v)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'flex items-center gap-1.5 px-2 py-1.5 cursor-pointer hover:bg-(--color-surface-hover) rounded-sm transition-colors',
                    dragOver && 'ring-2 ring-(--color-primary)/50 bg-(--color-primary)/5'
                )}
            >
                <ChevronRight
                    className={cn(
                        'h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-150',
                        expanded && 'rotate-90'
                    )}
                />
                <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-xs font-medium truncate min-w-0 text-(--color-text)">
                    Recent
                </span>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground tabular-nums shrink-0">
                    {tabs.length}
                </span>
            </div>
            {expanded && (
                <div className="ml-1">
                    {tabs.map((tab) => (
                        <TabItem key={tab.id} tab={tab} isActive={tab.id === activeTabId} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function Sidebar() {
    const { collections, sidebarOpen } = useCollectionsStore();
    const [creating, setCreating] = useState(false);

    if (!sidebarOpen) return null;

    return (
        <div className="flex flex-col h-full w-64 shrink-0 border-r border-(--color-border) bg-(--color-surface-raised)/40">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-(--color-border) shrink-0">
                <span className="text-xs font-semibold text-(--color-text) tracking-wide uppercase">
                    Collections
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCreating(true)}
                    className="h-6 w-6 text-muted-foreground hover:text-(--color-text)"
                    aria-label="New collection"
                >
                    <FolderPlus className="h-3.5 w-3.5" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                <RecentSection />

                {collections.length > 0 && <div className="h-px bg-(--color-border) mx-1 my-1.5" />}

                {collections.map((c) => (
                    <CollectionItem key={c.id} collection={c} />
                ))}

                {creating && <NewCollectionInput onDone={() => setCreating(false)} />}
            </div>
        </div>
    );
}
