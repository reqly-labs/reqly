import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

function corsProxyPlugin(): Plugin {
    const SKIP_HEADERS = new Set(['x-proxy-url', 'host', 'connection', 'transfer-encoding']);

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

        const forwardHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(req.headers)) {
            if (SKIP_HEADERS.has(key.toLowerCase())) continue;
            if (typeof value === 'string') forwardHeaders[key] = value;
        }

        try {
            const method = req.method ?? 'GET';
            const hasBody = !!body?.length && !['GET', 'HEAD'].includes(method.toUpperCase());

            const upstream = await fetch(targetUrl, {
                method,
                headers: forwardHeaders,
                body: hasBody ? body : undefined,
            });

            res.statusCode = upstream.status;
            upstream.headers.forEach((value, key) => {
                const lower = key.toLowerCase();
                if (
                    lower === 'content-encoding' ||
                    lower === 'transfer-encoding' ||
                    lower === 'content-length'
                )
                    return;
                res.setHeader(key, value);
            });

            const buffer = Buffer.from(await upstream.arrayBuffer());
            res.setHeader('Content-Length', buffer.byteLength);
            res.end(buffer);
        } catch (e) {
            res.statusCode = 502;
            res.end(String(e));
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
    resolve: {
        alias: { '@': `${process.cwd()}/src` },
    },
});
