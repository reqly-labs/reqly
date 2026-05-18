import { useAuth } from '@/core/auth';
import {
    fetchCloudCollections,
    saveCollectionsToCloud,
    subscribeToCloudCollections,
} from '@/core/sync';
import { useCollectionsStore } from '@/modules/request/store/collections';
import { useTabsStore } from '@/modules/request/store/tabs';
import type { Collection } from '@/modules/request/types';
import type { Unsubscribe } from 'firebase/firestore';
import { useEffect, useRef, type ReactNode } from 'react';

let _isSyncingFromCloud = false;

export function isSyncingFromCloud() {
    return _isSyncingFromCloud;
}

export function SyncProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const unsubRef = useRef<Unsubscribe | null>(null);
    const prevUserRef = useRef<string | null>(null);

    useEffect(() => {
        const currentUid = user?.uid ?? null;
        const prevUid = prevUserRef.current;

        if (currentUid === prevUid) return;
        prevUserRef.current = currentUid;

        if (unsubRef.current) {
            unsubRef.current();
            unsubRef.current = null;
        }

        if (!currentUid || !user) {
            useCollectionsStore.getState().clearCollections();
            useTabsStore.getState().clearTabs();
            return;
        }

        (async () => {
            const localCollections = useCollectionsStore.getState().collections;
            const cloudCollections = await fetchCloudCollections(currentUid);

            const merged = mergeCollections(cloudCollections, localCollections);

            _isSyncingFromCloud = true;
            useCollectionsStore.setState({ collections: merged });
            _isSyncingFromCloud = false;

            await saveCollectionsToCloud(currentUid, merged);

            unsubRef.current = subscribeToCloudCollections(user, (cloudData) => {
                _isSyncingFromCloud = true;
                useCollectionsStore.setState({ collections: cloudData });
                _isSyncingFromCloud = false;
            });
        })();

        return () => {
            if (unsubRef.current) {
                unsubRef.current();
                unsubRef.current = null;
            }
        };
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const unsub = useCollectionsStore.subscribe((state, prevState) => {
            if (_isSyncingFromCloud) return;
            if (state.collections === prevState.collections) return;
            saveCollectionsToCloud(user.uid, state.collections);
        });

        return unsub;
    }, [user]);

    return <>{children}</>;
}

function mergeCollections(cloud: Collection[], local: Collection[]): Collection[] {
    const merged = [...cloud];
    const cloudIds = new Set(cloud.map((c) => c.id));

    for (const localCol of local) {
        if (!cloudIds.has(localCol.id)) {
            merged.push(localCol);
        }
    }

    return merged;
}
