export interface DragPayload {
    type: 'tab' | 'request';
    tabId?: string;
    requestId?: string;
    sourceCollectionId?: string;
}

export const drag: { current: DragPayload | null } = { current: null };
