import { BODY_TYPES, HTTP_METHODS } from '@/core/constants';

export type HttpMethod = (typeof HTTP_METHODS)[number];
export type BodyType = (typeof BODY_TYPES)[number];

export interface KV {
    id: string;
    key: string;
    value: string;
    enabled: boolean;
}

export interface ApiResponse {
    status: number;
    statusText: string;
    time: number;
    size: number;
    headers: Record<string, string>;
    body: string;
    contentType: string;
    previewUrl?: string | null;
}

export interface TabSnapshot {
    method: HttpMethod;
    url: string;
    params: KV[];
    headers: KV[];
    bodyType: BodyType;
    body: string;
    formBody: KV[];
    response: ApiResponse | null;
}

export interface Tab {
    id: string;
    snapshot: TabSnapshot;
}
