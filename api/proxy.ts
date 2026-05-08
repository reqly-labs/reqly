export const config = { runtime: 'edge' };

const SKIP_HEADERS = new Set([
    'x-proxy-url',
    'host',
    'connection',
    'transfer-encoding',
    'content-length',
    'origin',
    'referer',
]);

export default async function handler(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    const targetUrl = request.headers.get('X-Proxy-Url');
    if (!targetUrl) {
        return new Response('Missing X-Proxy-Url header', { status: 400 });
    }

    const forwardHeaders = new Headers();
    for (const [key, value] of request.headers.entries()) {
        const lower = key.toLowerCase();
        if (SKIP_HEADERS.has(lower) || lower.startsWith('sec-')) continue;
        forwardHeaders.set(key, value);
    }

    const hasBody = !['GET', 'HEAD'].includes(request.method.toUpperCase());
    const body = hasBody ? await request.arrayBuffer() : undefined;

    let upstream: Response;
    try {
        upstream = await fetch(targetUrl, {
            method: request.method,
            headers: forwardHeaders,
            body,
        });
    } catch {
        return new Response('Upstream request failed', { status: 502 });
    }

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', '*');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.delete('content-encoding');

    return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
    });
}
