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

export function useRequest() {
    const {
        method,
        url,
        params,
        headers,
        bodyType,
        body,
        formBody,
        response,
        setResponse,
        setLoading,
        setError,
    } = useRequestStore();

    const send = async () => {
        if (!url.trim()) return;

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

            const res = await axios.request<ArrayBuffer>({
                method,
                url: '/__proxy',
                headers: {
                    ...reqHeaders,
                    'X-Proxy-Url': targetUrl.toString(),
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
                if (response?.previewUrl) {
                    URL.revokeObjectURL(response.previewUrl);
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
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    };

    return { send };
}
