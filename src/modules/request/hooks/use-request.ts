import axios from 'axios';
import { useRequestStore } from '../store';

export function useRequest() {
    const {
        method,
        url,
        params,
        headers,
        bodyType,
        body,
        formBody,
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

            const res = await axios.request<string>({
                method,
                url: url.trim(),
                params: Object.keys(reqParams).length ? reqParams : undefined,
                headers: Object.keys(reqHeaders).length ? reqHeaders : undefined,
                data: reqData,
                responseType: 'text',
                timeout: 30_000,
                validateStatus: () => true,
                maxRedirects: 10,
            });

            const elapsed = Math.round(performance.now() - start);
            const responseText = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);

            const respHeaders: Record<string, string> = {};
            Object.entries(res.headers).forEach(([k, v]) => {
                if (typeof v === 'string') respHeaders[k] = v;
            });

            setResponse({
                status: res.status,
                statusText: res.statusText,
                time: elapsed,
                size: new Blob([responseText]).size,
                headers: respHeaders,
                body: responseText,
                contentType: (res.headers['content-type'] as string) ?? '',
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    };

    return { send };
}
