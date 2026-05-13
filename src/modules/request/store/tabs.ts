import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KV, Tab, TabSnapshot } from '../types';

function newKV(): KV {
    return {
        id: Math.random().toString(36).slice(2),
        key: '',
        value: '',
        enabled: true,
    };
}

export function defaultSnapshot(): TabSnapshot {
    return {
        method: 'GET',
        url: '',
        params: [newKV()],
        headers: [newKV()],
        bodyType: 'json',
        body: '',
        formBody: [newKV()],
        auth: { type: 'none' },
        response: null,
    };
}

function newTab(): Tab {
    return {
        id: Math.random().toString(36).slice(2),
        snapshot: defaultSnapshot(),
    };
}

interface TabsState {
    tabs: Tab[];
    activeTabId: string;
}

interface TabsActions {
    addTab: () => string;
    closeTab: (id: string) => string | null;
    setActiveTab: (id: string) => void;
    syncActiveTab: (snapshot: TabSnapshot) => void;
    renameTab: (id: string, name: string) => void;
}

const initialTab = newTab();

export const useTabsStore = create<TabsState & TabsActions>()(
    persist(
        (set, get) => ({
            tabs: [initialTab],
            activeTabId: initialTab.id,

            addTab: () => {
                const tab = newTab();
                set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }));
                return tab.id;
            },

            closeTab: (id) => {
                const { tabs, activeTabId } = get();
                if (tabs.length === 1) return null;

                const idx = tabs.findIndex((t) => t.id === id);
                const neighbour = tabs[idx === 0 ? 1 : idx - 1];
                const nextActiveId = activeTabId === id ? neighbour.id : activeTabId;

                set({
                    tabs: tabs.filter((t) => t.id !== id),
                    activeTabId: nextActiveId,
                });

                return activeTabId === id ? nextActiveId : null;
            },

            setActiveTab: (id) => set({ activeTabId: id }),

            syncActiveTab: (snapshot) => {
                set((s) => ({
                    tabs: s.tabs.map((t) => (t.id === s.activeTabId ? { ...t, snapshot } : t)),
                }));
            },

            renameTab: (id, name) => {
                set((s) => ({
                    tabs: s.tabs.map((t) =>
                        t.id === id ? { ...t, name: name.trim() || undefined } : t
                    ),
                }));
            },
        }),
        {
            name: 'reqly:tabs',
            partialize: (state) => ({
                tabs: state.tabs.map((t) => ({
                    ...t,
                    snapshot: {
                        ...t.snapshot,
                        response: t.snapshot.response
                            ? { ...t.snapshot.response, previewUrl: null }
                            : null,
                    },
                })),
                activeTabId: state.activeTabId,
            }),
        }
    )
);
