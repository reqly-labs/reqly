import axios from 'axios';
import { useRequestStore } from '../store';

function getMimeType(contentType: string): string {
    return contentType.split(';')[0]?.trim().toLowerCase() ?? '';
}

function getCharset(contentType: string): string {
    const match = contentType.match(/charset=([^;]+)/i);
    return match?.[1]?.trim() || 'utf-8';
}

function decodeText(data: ArrayBuffer, contentType: string): string {
    try {
        return new TextDecoder(getCharset(contentType)).decode(new Uint8Array(data));
    } catch {
        return new TextDecoder('utf-8').decode(new Uint8Array(data));
    }
}

function resolveTransport(targetUrl: string): {
    requestUrl: string;
    proxyHeaders: Record<string, string>;
} {
    const externalProxyUrl = import.meta.env.VITE_PROXY_URL?.trim();

    if (import.meta.env.DEV) {
        return {
            requestUrl: '/__proxy',
            proxyHeaders: { 'X-Proxy-Url': targetUrl },
        };
    }

    if (externalProxyUrl) {
        return {
            requestUrl: externalProxyUrl,
            proxyHeaders: { 'X-Proxy-Url': targetUrl },
        };
    }

    return {
        requestUrl: targetUrl,
        proxyHeaders: {},
    };
}

export function useRequest() {
    const { setResponse, setLoading, setError, nextRequest } = useRequestStore();

    const send = async () => {
        // Read ALL values fresh from the store at call-time, not from the closure
        const { url, method, params, headers, bodyType, body, formBody } =
            useRequestStore.getState();

        if (!url.trim()) return;

        nextRequest();
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const reqParams: Record<string, string> = {};
            params.filter((p) => p.enabled && p.key).forEach((p) => (reqParams[p.key] = p.value));

            const reqHeaders: Record<string, string> = {};
            headers.filter((h) => h.enabled && h.key).forEach((h) => (reqHeaders[h.key] = h.value));

            let reqData: string | undefined;

            if (method !== 'GET' && bodyType !== 'none') {
                if (bodyType === 'json') {
                    reqData = body;
                    reqHeaders['Content-Type'] ??= 'application/json';
                } else if (bodyType === 'xml') {
                    reqData = body;
                    reqHeaders['Content-Type'] ??= 'application/xml';
                } else if (bodyType === 'text') {
                    reqData = body;
                    reqHeaders['Content-Type'] ??= 'text/plain';
                } else if (bodyType === 'form') {
                    const fd = new URLSearchParams();
                    formBody
                        .filter((f) => f.enabled && f.key)
                        .forEach((f) => fd.append(f.key, f.value));
                    reqData = fd.toString();
                    reqHeaders['Content-Type'] ??= 'application/x-www-form-urlencoded';
                }
            }

            const start = performance.now();

            const targetUrl = new URL(url.trim());
            Object.entries(reqParams).forEach(([k, v]) => targetUrl.searchParams.append(k, v));

            const { requestUrl, proxyHeaders } = resolveTransport(targetUrl.toString());

            const res = await axios.request<ArrayBuffer>({
                method,
                url: requestUrl,
                headers: {
                    ...reqHeaders,
                    ...proxyHeaders,
                },
                data: reqData,
                responseType: 'arraybuffer',
                timeout: 30_000,
                validateStatus: () => true,
            });

            const elapsed = Math.round(performance.now() - start);
            const contentType = (res.headers['content-type'] as string) ?? '';
            const mimeType = getMimeType(contentType);
            const isImage = mimeType.startsWith('image/');

            const respHeaders: Record<string, string> = {};
            Object.entries(res.headers).forEach(([k, v]) => {
                if (typeof v === 'string') respHeaders[k] = v;
                else if (Array.isArray(v)) respHeaders[k] = v.join(', ');
            });

            let responseBody = '';
            let previewUrl: string | null = null;

            if (isImage) {
                const prev = useRequestStore.getState().response;
                if (prev?.previewUrl) {
                    URL.revokeObjectURL(prev.previewUrl);
                }
                previewUrl = URL.createObjectURL(
                    new Blob([res.data], {
                        type: mimeType || 'application/octet-stream',
                    })
                );
            } else {
                responseBody = decodeText(res.data, contentType);
            }

            setResponse({
                status: res.status,
                statusText: res.statusText,
                time: elapsed,
                size: res.data.byteLength,
                headers: respHeaders,
                body: responseBody,
                contentType,
                previewUrl,
            });
        } catch {
            setError('Request failed');
        } finally {
            setLoading(false);
        }
    };

    return { send };
}
