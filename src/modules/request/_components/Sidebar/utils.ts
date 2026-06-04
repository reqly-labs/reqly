import { useRequestStore } from '../../_store';
import type { Collection, SavedRequest, Tab, TabSnapshot } from '../../_types';

export function captureSnapshot(): TabSnapshot {
    const {
        method,
        url,
        params,
        headers,
        bodyType,
        body,
        formBody,
        multipartBody,
        auth,
        response,
    } = useRequestStore.getState();
    return {
        method,
        url,
        params,
        headers,
        bodyType,
        body,
        formBody,
        multipartBody,
        auth,
        response,
    };
}

export function isTabInAnyCollection(tab: Tab, collections: Collection[]): boolean {
    if (tab.savedRequestId) return true;
    for (const col of collections) {
        if (
            col.requests.some(
                (r) =>
                    r.snapshot.method === tab.snapshot.method &&
                    r.snapshot.url.trim() === tab.snapshot.url.trim() &&
                    r.snapshot.url.trim() !== ''
            )
        )
            return true;
        if (isTabInAnyCollection(tab, col.folders ?? [])) return true;
    }
    return false;
}

export function requestLabel(req: SavedRequest): string {
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

export function tabLabel(tab: Tab): string {
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
