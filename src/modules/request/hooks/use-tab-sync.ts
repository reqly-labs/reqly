import { useEffect } from 'react';
import { _resetSkipCollectionSync, _skipCollectionSync, useRequestStore } from '../store';
import { useCollectionsStore } from '../store/collections';
import { useTabsStore } from '../store/tabs';
import type { TabSnapshot } from '../types';

export function useTabSync() {
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
}
