import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import axios from 'axios';
import type { IncomingMessage, ServerResponse } from 'node:http';
import http from 'node:http';
import https from 'node:https';
import { defineConfig, type Plugin } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

function corsProxyPlugin(): Plugin {
    const SKIP_HEADERS = new Set([
        'x-proxy-url',
        'host',
        'connection',
        'transfer-encoding',
        'content-length',
        'accept-encoding',
        'origin',
        'referer',
    ]);

    const httpAgent = new http.Agent();
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const targetUrl = req.headers['x-proxy-url'];
        if (typeof targetUrl !== 'string' || !targetUrl) {
            res.statusCode = 400;
            res.end('Missing X-Proxy-Url header');
            return;
        }

        let target: URL;
        try {
            target = new URL(targetUrl);
        } catch {
            res.statusCode = 400;
            res.end('Invalid X-Proxy-Url value');
            return;
        }

        const chunks: Buffer[] = [];
        try {
            await new Promise<void>((resolve, reject) => {
                req.on('data', (chunk: Buffer) => chunks.push(chunk));
                req.on('end', resolve);
                req.on('error', reject);
            });
        } catch {
            if (!res.headersSent) {
                res.statusCode = 400;
                res.end('Failed to read request body');
            }
            return;
        }

        const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
        const method = req.method ?? 'GET';
        const headers: Record<string, string> = {};

        for (const [key, value] of Object.entries(req.headers)) {
            const normalizedKey = key.toLowerCase();
            if (SKIP_HEADERS.has(normalizedKey) || normalizedKey.startsWith('sec-')) continue;
            if (typeof value === 'string') headers[key] = value;
        }

        try {
            const upstream = await axios.request<ArrayBuffer>({
                url: target.toString(),
                method,
                headers,
                data: ['GET', 'HEAD'].includes(method.toUpperCase()) ? undefined : body,
                responseType: 'arraybuffer',
                timeout: 30_000,
                validateStatus: () => true,
                decompress: true,
                httpAgent,
                httpsAgent,
            });

            res.statusCode = upstream.status;

            for (const [key, value] of Object.entries(upstream.headers)) {
                if (typeof value === 'undefined') continue;
                const normalizedKey = key.toLowerCase();
                if (
                    normalizedKey === 'content-encoding' ||
                    normalizedKey === 'transfer-encoding' ||
                    normalizedKey === 'content-length'
                ) {
                    continue;
                }
                res.setHeader(key, Array.isArray(value) ? value : String(value));
            }

            const responseBody = Buffer.from(upstream.data);
            res.setHeader('Content-Length', responseBody.byteLength);
            res.end(responseBody);
        } catch (error: unknown) {
            if (!res.headersSent) {
                res.statusCode = 502;
                res.end(error instanceof Error ? error.message : String(error));
            }
        }
    }

    function mountProxy(middlewares: {
        use: (path: string, fn: (req: IncomingMessage, res: ServerResponse) => void) => void;
    }) {
        middlewares.use('/__proxy', (req: IncomingMessage, res: ServerResponse) => {
            handler(req, res).catch((error: unknown) => {
                if (!res.headersSent) {
                    res.statusCode = 502;
                    res.end(error instanceof Error ? error.message : 'Proxy error');
                }
            });
        });
    }

    return {
        name: 'cors-proxy',
        configureServer(server) {
            mountProxy(server.middlewares);
        },
        configurePreviewServer(server) {
            mountProxy(server.middlewares);
        },
    };
}

export default defineConfig({
    plugins: [
        corsProxyPlugin(),
        tailwindcss(),
        tsConfigPaths({ projects: ['./tsconfig.json'] }),
        react(),
    ],
    resolve: {
        alias: { '@': `${process.cwd()}/src` },
    },
});
