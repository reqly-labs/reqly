import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Collection, SavedRequest, TabSnapshot } from '../types';

function uid(): string {
    return Math.random().toString(36).slice(2);
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
    renameCollection: (id: string, name: string) => void;
    removeCollection: (id: string) => void;
    toggleExpanded: (id: string) => void;
    addRequest: (collectionId: string, name: string, snapshot: TabSnapshot) => string;
    renameRequest: (collectionId: string, requestId: string, name: string) => void;
    renameRequestByMethodUrl: (method: string, url: string, name: string) => void;
    removeRequest: (collectionId: string, requestId: string) => void;
    updateRequest: (collectionId: string, requestId: string, snapshot: TabSnapshot) => void;
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
                    collections: [...s.collections, { id, name, requests: [] }],
                    expandedIds: [...s.expandedIds, id],
                }));
                return id;
            },

            renameCollection: (id, name) => {
                set((s) => ({
                    collections: s.collections.map((c) =>
                        c.id === id ? { ...c, name: name.trim() || c.name } : c
                    ),
                }));
            },

            removeCollection: (id) => {
                set((s) => ({
                    collections: s.collections.filter((c) => c.id !== id),
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
                const existing = get()
                    .collections.find((c) => c.id === collectionId)
                    ?.requests.find(
                        (r) =>
                            r.snapshot.method === snapshot.method &&
                            r.snapshot.url.trim() === snapshot.url.trim()
                    );
                if (existing) return existing.id;

                const id = uid();
                const saved: SavedRequest = {
                    id,
                    name,
                    snapshot: { ...snapshot, response: null },
                };
                set((s) => ({
                    collections: s.collections.map((c) =>
                        c.id === collectionId ? { ...c, requests: [...c.requests, saved] } : c
                    ),
                }));
                return id;
            },

            renameRequest: (collectionId, requestId, name) => {
                set((s) => ({
                    collections: s.collections.map((c) =>
                        c.id === collectionId
                            ? {
                                  ...c,
                                  requests: c.requests.map((r) =>
                                      r.id === requestId ? { ...r, name: name.trim() || r.name } : r
                                  ),
                              }
                            : c
                    ),
                }));
            },

            renameRequestByMethodUrl: (method, url, name) => {
                const trimmed = name.trim();
                if (!trimmed) return;
                set((s) => ({
                    collections: s.collections.map((c) => ({
                        ...c,
                        requests: c.requests.map((r) =>
                            r.snapshot.method === method && r.snapshot.url.trim() === url.trim()
                                ? { ...r, name: trimmed }
                                : r
                        ),
                    })),
                }));
            },

            removeRequest: (collectionId, requestId) => {
                set((s) => ({
                    collections: s.collections.map((c) =>
                        c.id === collectionId
                            ? { ...c, requests: c.requests.filter((r) => r.id !== requestId) }
                            : c
                    ),
                }));
            },

            updateRequest: (collectionId, requestId, snapshot) => {
                set((s) => ({
                    collections: s.collections.map((c) =>
                        c.id === collectionId
                            ? {
                                  ...c,
                                  requests: c.requests.map((r) =>
                                      r.id === requestId
                                          ? { ...r, snapshot: { ...snapshot, response: null } }
                                          : r
                                  ),
                              }
                            : c
                    ),
                }));
            },

            moveRequest: (fromCollectionId, toCollectionId, requestId) => {
                set((s) => {
                    const source = s.collections.find((c) => c.id === fromCollectionId);
                    const req = source?.requests.find((r) => r.id === requestId);
                    if (!req) return s;

                    const target = s.collections.find((c) => c.id === toCollectionId);
                    const alreadyExists = target?.requests.some(
                        (r) =>
                            r.snapshot.method === req.snapshot.method &&
                            r.snapshot.url.trim() === req.snapshot.url.trim()
                    );
                    if (alreadyExists) {
                        return {
                            collections: s.collections.map((c) =>
                                c.id === fromCollectionId
                                    ? {
                                          ...c,
                                          requests: c.requests.filter((r) => r.id !== requestId),
                                      }
                                    : c
                            ),
                        };
                    }

                    return {
                        collections: s.collections.map((c) => {
                            if (c.id === fromCollectionId) {
                                return {
                                    ...c,
                                    requests: c.requests.filter((r) => r.id !== requestId),
                                };
                            }
                            if (c.id === toCollectionId) {
                                return { ...c, requests: [...c.requests, req] };
                            }
                            return c;
                        }),
                    };
                });
            },
        }),
        {
            name: 'reqly:collections',
            partialize: (state) => ({
                collections: state.collections.map((c) => ({
                    ...c,
                    requests: c.requests.map((r) => ({
                        ...r,
                        snapshot: { ...r.snapshot, response: null },
                    })),
                })),
                expandedIds: state.expandedIds,
                sidebarOpen: state.sidebarOpen,
            }),
        }
    )
);
