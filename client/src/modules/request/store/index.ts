import { create } from 'zustand';
import type {
    ApiResponse,
    Auth,
    BodyType,
    FormDataField,
    HttpMethod,
    KV,
    TabSnapshot,
} from '../types';
import { defaultSnapshot, useTabsStore } from './tabs';

function newKV(): KV {
    return {
        id: Math.random().toString(36).slice(2),
        key: '',
        value: '',
        enabled: true,
    };
}

function newFormDataField(): FormDataField {
    return {
        id: Math.random().toString(36).slice(2),
        key: '',
        value: '',
        type: 'text',
        enabled: true,
    };
}

interface RequestState {
    method: HttpMethod;
    url: string;
    params: KV[];
    headers: KV[];
    bodyType: BodyType;
    body: string;
    formBody: KV[];
    multipartBody: FormDataField[];
    /** File objects keyed by FormDataField.id — in-memory only, not persisted */
    multipartFiles: Record<string, File>;
    auth: Auth;
    response: ApiResponse | null;
    loading: boolean;
    error: string | null;
    requestId: number;
}

interface RequestActions {
    setMethod: (method: HttpMethod) => void;
    setUrl: (url: string) => void;
    setParams: (params: KV[]) => void;
    setHeaders: (headers: KV[]) => void;
    setBodyType: (bodyType: BodyType) => void;
    setBody: (body: string) => void;
    setFormBody: (formBody: KV[]) => void;
    setMultipartBody: (multipartBody: FormDataField[]) => void;
    setMultipartFiles: (multipartFiles: Record<string, File>) => void;
    setAuth: (auth: Auth) => void;
    setResponse: (response: ApiResponse | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    nextRequest: () => void;
    initFromSnapshot: (snapshot: TabSnapshot) => void;
    patch: (partial: Partial<RequestState>) => void;
}

function getInitialSnapshot(): TabSnapshot {
    const { tabs, activeTabId } = useTabsStore.getState();
    return tabs.find((t) => t.id === activeTabId)?.snapshot ?? defaultSnapshot();
}

export const useRequestStore = create<RequestState & RequestActions>((set, get) => {
    const init = getInitialSnapshot();

    return {
        ...init,
        auth: init.auth ?? { type: 'none' },
        multipartBody: init.multipartBody ?? [newFormDataField()],
        multipartFiles: {},
        loading: false,
        error: null,
        requestId: 0,

        setMethod: (method) => set({ method }),
        nextRequest: () => set((s) => ({ requestId: s.requestId + 1 })),
        setUrl: (url) => set({ url }),
        setParams: (params) => set({ params }),
        setHeaders: (headers) => set({ headers }),
        setBodyType: (bodyType) => set({ bodyType }),
        setBody: (body) => set({ body }),
        setFormBody: (formBody) => set({ formBody }),
        setMultipartBody: (multipartBody) => set({ multipartBody }),
        setMultipartFiles: (multipartFiles) => set({ multipartFiles }),
        setAuth: (auth) => set({ auth }),
        setResponse: (response) => {
            const previous = get().response;
            if (previous?.previewUrl && previous.previewUrl !== response?.previewUrl) {
                URL.revokeObjectURL(previous.previewUrl);
            }
            set({ response });
        },
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        initFromSnapshot: (snapshot) => {
            _skipCollectionSync = true;
            set({
                ...snapshot,
                auth: snapshot.auth ?? { type: 'none' },
                multipartBody: snapshot.multipartBody ?? [newFormDataField()],
                multipartFiles: {},
                loading: false,
                error: null,
            });
        },
        patch: (partial) => set(partial),
    };
});

export { newFormDataField, newKV };

export let _skipCollectionSync = false;
export function _resetSkipCollectionSync() {
    _skipCollectionSync = false;
}
