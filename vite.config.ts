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

        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
            req.on('data', (chunk: Buffer) => chunks.push(chunk));
            req.on('end', resolve);
            req.on('error', reject);
        });

        const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
        const method = req.method ?? 'GET';
        const target = new URL(targetUrl);
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
            console.error('[cors-proxy]', error);
            res.statusCode = 502;
            res.end(error instanceof Error ? error.message : String(error));
        }
    }

    return {
        name: 'cors-proxy',
        configureServer(server) {
            server.middlewares.use('/__proxy', (req, res, next) => {
                handler(req, res).catch(next);
            });
        },
        configurePreviewServer(server) {
            server.middlewares.use('/__proxy', (req, res, next) => {
                handler(req, res).catch(next);
            });
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
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;

                    if (
                        id.includes('/node_modules/@uiw/react-codemirror/') ||
                        id.includes('/node_modules/@codemirror/') ||
                        id.includes('/node_modules/@lezer/')
                    ) {
                        return 'codemirror';
                    }

                    if (
                        id.includes('/node_modules/react/') ||
                        id.includes('/node_modules/react-dom/') ||
                        id.includes('/node_modules/react-router-dom/')
                    ) {
                        return 'react-vendor';
                    }

                    if (
                        id.includes('/node_modules/@tanstack/react-query/') ||
                        id.includes('/node_modules/zustand/') ||
                        id.includes('/node_modules/axios/')
                    ) {
                        return 'data-vendor';
                    }

                    if (
                        id.includes('/node_modules/@radix-ui/') ||
                        id.includes('/node_modules/lucide-react/') ||
                        id.includes('/node_modules/class-variance-authority/') ||
                        id.includes('/node_modules/clsx/') ||
                        id.includes('/node_modules/tailwind-merge/')
                    ) {
                        return 'ui-vendor';
                    }
                },
            },
        },
    },
    resolve: {
        alias: { '@': `${process.cwd()}/src` },
    },
});
