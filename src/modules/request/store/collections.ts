import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Collection, SavedRequest, TabSnapshot } from '../types';

function uid(): string {
    return Math.random().toString(36).slice(2);
}

function mapCollections(
    collections: Collection[],
    id: string,
    updater: (c: Collection) => Collection
): Collection[] {
    return collections.map((c) => {
        if (c.id === id) return updater(c);
        return { ...c, folders: mapCollections(c.folders ?? [], id, updater) };
    });
}

function filterCollections(collections: Collection[], id: string): Collection[] {
    return collections
        .filter((c) => c.id !== id)
        .map((c) => ({ ...c, folders: filterCollections(c.folders ?? [], id) }));
}

function findCollection(collections: Collection[], id: string): Collection | undefined {
    for (const c of collections) {
        if (c.id === id) return c;
        const found = findCollection(c.folders ?? [], id);
        if (found) return found;
    }
    return undefined;
}

function deepMapRequests(
    collections: Collection[],
    mapper: (r: SavedRequest) => SavedRequest
): Collection[] {
    return collections.map((c) => ({
        ...c,
        requests: c.requests.map(mapper),
        folders: deepMapRequests(c.folders ?? [], mapper),
    }));
}

function deepClearResponses(c: Collection): Collection {
    return {
        ...c,
        requests: c.requests.map((r) => ({ ...r, snapshot: { ...r.snapshot, response: null } })),
        folders: (c.folders ?? []).map(deepClearResponses),
    };
}

function normalizeCollection(c: Collection): Collection {
    return {
        ...c,
        folders: (c.folders ?? []).map(normalizeCollection),
    };
}

interface CollectionsState {
    collections: Collection[];
    expandedIds: string[];
    sidebarOpen: boolean;
}

interface CollectionsActions {
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    addCollection: (name: string) => string;
    addFolder: (parentId: string, name: string) => string;
    renameCollection: (id: string, name: string) => void;
    removeCollection: (id: string) => void;
    toggleExpanded: (id: string) => void;
    addRequest: (collectionId: string, name: string, snapshot: TabSnapshot) => string;
    renameRequest: (collectionId: string, requestId: string, name: string) => void;
    renameRequestByMethodUrl: (method: string, url: string, name: string) => void;
    removeRequest: (collectionId: string, requestId: string) => void;
    updateRequest: (collectionId: string, requestId: string, snapshot: TabSnapshot) => void;
    updateRequestByMethodUrl: (method: string, url: string, snapshot: TabSnapshot) => void;
    moveRequest: (fromCollectionId: string, toCollectionId: string, requestId: string) => void;
}

export const useCollectionsStore = create<CollectionsState & CollectionsActions>()(
    persist(
        (set, get) => ({
            collections: [],
            expandedIds: [],
            sidebarOpen: false,

            toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),

            addCollection: (name) => {
                const id = uid();
                set((s) => ({
                    collections: [...s.collections, { id, name, requests: [], folders: [] }],
                    expandedIds: [...s.expandedIds, id],
                }));
                return id;
            },

            addFolder: (parentId, name) => {
                const id = uid();
                set((s) => ({
                    collections: mapCollections(s.collections, parentId, (c) => ({
                        ...c,
                        folders: [...(c.folders ?? []), { id, name, requests: [], folders: [] }],
                    })),
                    expandedIds: [...s.expandedIds, id],
                }));
                return id;
            },

            renameCollection: (id, name) => {
                set((s) => ({
                    collections: mapCollections(s.collections, id, (c) => ({
                        ...c,
                        name: name.trim() || c.name,
                    })),
                }));
            },

            removeCollection: (id) => {
                set((s) => ({
                    collections: filterCollections(s.collections, id),
                    expandedIds: s.expandedIds.filter((eid) => eid !== id),
                }));
            },

            toggleExpanded: (id) => {
                set((s) => ({
                    expandedIds: s.expandedIds.includes(id)
                        ? s.expandedIds.filter((eid) => eid !== id)
                        : [...s.expandedIds, id],
                }));
            },

            addRequest: (collectionId, name, snapshot) => {
                if (snapshot.url.trim()) {
                    const existing = findCollection(get().collections, collectionId)?.requests.find(
                        (r) =>
                            r.snapshot.method === snapshot.method &&
                            r.snapshot.url.trim() === snapshot.url.trim()
                    );
                    if (existing) return existing.id;
                }

                const id = uid();
                const saved: SavedRequest = {
                    id,
                    name,
                    snapshot: { ...snapshot, response: null },
                };
                set((s) => ({
                    collections: mapCollections(s.collections, collectionId, (c) => ({
                        ...c,
                        requests: [...c.requests, saved],
                    })),
                }));
                return id;
            },

            renameRequest: (collectionId, requestId, name) => {
                set((s) => ({
                    collections: mapCollections(s.collections, collectionId, (c) => ({
                        ...c,
                        requests: c.requests.map((r) =>
                            r.id === requestId ? { ...r, name: name.trim() || r.name } : r
                        ),
                    })),
                }));
            },

            renameRequestByMethodUrl: (method, url, name) => {
                const trimmed = name.trim();
                if (!trimmed) return;
                set((s) => ({
                    collections: deepMapRequests(s.collections, (r) =>
                        r.snapshot.method === method && r.snapshot.url.trim() === url.trim()
                            ? { ...r, name: trimmed }
                            : r
                    ),
                }));
            },

            removeRequest: (collectionId, requestId) => {
                set((s) => ({
                    collections: mapCollections(s.collections, collectionId, (c) => ({
                        ...c,
                        requests: c.requests.filter((r) => r.id !== requestId),
                    })),
                }));
            },

            updateRequest: (collectionId, requestId, snapshot) => {
                set((s) => ({
                    collections: mapCollections(s.collections, collectionId, (c) => ({
                        ...c,
                        requests: c.requests.map((r) =>
                            r.id === requestId
                                ? { ...r, snapshot: { ...snapshot, response: null } }
                                : r
                        ),
                    })),
                }));
            },

            updateRequestByMethodUrl: (method, url, snapshot) => {
                set((s) => ({
                    collections: deepMapRequests(s.collections, (r) =>
                        r.snapshot.method === method && r.snapshot.url.trim() === url.trim()
                            ? { ...r, snapshot: { ...snapshot, response: null } }
                            : r
                    ),
                }));
            },

            moveRequest: (fromCollectionId, toCollectionId, requestId) => {
                set((s) => {
                    const from = findCollection(s.collections, fromCollectionId);
                    const req = from?.requests.find((r) => r.id === requestId);
                    if (!req) return s;

                    const to = findCollection(s.collections, toCollectionId);
                    const alreadyExists = to?.requests.some(
                        (r) =>
                            r.snapshot.method === req.snapshot.method &&
                            r.snapshot.url.trim() === req.snapshot.url.trim()
                    );

                    let updated = mapCollections(s.collections, fromCollectionId, (c) => ({
                        ...c,
                        requests: c.requests.filter((r) => r.id !== requestId),
                    }));

                    if (!alreadyExists) {
                        updated = mapCollections(updated, toCollectionId, (c) => ({
                            ...c,
                            requests: [...c.requests, req],
                        }));
                    }

                    return { collections: updated };
                });
            },
        }),
        {
            name: 'reqly:collections',
            partialize: (state) => ({
                collections: state.collections.map(deepClearResponses),
                expandedIds: state.expandedIds,
                sidebarOpen: state.sidebarOpen,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.collections = state.collections.map(normalizeCollection);
                }
            },
        }
    )
);
