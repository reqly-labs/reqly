import { HTTP_METHODS } from '@/core/constants';
import type { FormDataField } from '../types';

export interface ParsedCurl {
    method: (typeof HTTP_METHODS)[number];
    url: string;
    headers: Record<string, string>;
    data?: string;
    multipartFields?: FormDataField[];
}

function tokenizeCurl(input: string): string[] {
    const normalized = input.replace(/\\\r?\n/g, ' ').trim();
    const tokens: string[] = [];

    let current = '';
    let quote: "'" | '"' | null = null;

    for (let i = 0; i < normalized.length; i += 1) {
        const ch = normalized[i];

        if (quote === "'") {
            if (ch === "'") {
                quote = null;
            } else {
                current += ch;
            }
            continue;
        }

        if (quote === '"') {
            if (ch === '"') {
                quote = null;
                continue;
            }

            if (ch === '\\' && i + 1 < normalized.length) {
                const next = normalized[i + 1];
                if (next === '"' || next === '\\') {
                    current += next;
                    i += 1;
                    continue;
                }
            }

            current += ch;
            continue;
        }

        if (ch === "'" || ch === '"') {
            quote = ch;
            continue;
        }

        if (/\s/.test(ch)) {
            if (current) {
                tokens.push(current);
                current = '';
            }
            continue;
        }

        if (ch === '\\' && i + 1 < normalized.length) {
            current += normalized[i + 1];
            i += 1;
            continue;
        }

        current += ch;
    }

    if (current) tokens.push(current);
    return tokens;
}

function normalizeMethod(method?: string): (typeof HTTP_METHODS)[number] {
    const upper = (method || '').toUpperCase();
    if (HTTP_METHODS.includes(upper as (typeof HTTP_METHODS)[number])) {
        return upper as (typeof HTTP_METHODS)[number];
    }
    return 'GET';
}

function parseHeader(raw: string): { key: string; value: string } | null {
    const idx = raw.indexOf(':');
    if (idx <= 0) return null;

    const key = raw.slice(0, idx).trim();
    const value = raw.slice(idx + 1).trim();

    if (!key) return null;
    return { key, value };
}

function nextValue(tokens: string[], idx: number): string | null {
    if (idx + 1 >= tokens.length) return null;
    return tokens[idx + 1];
}

export function parseCurlCommand(input: string): ParsedCurl | null {
    const trimmed = input.trim();
    if (!trimmed.toLowerCase().startsWith('curl ')) return null;

    const tokens = tokenizeCurl(trimmed);
    if (tokens.length === 0 || tokens[0].toLowerCase() !== 'curl') return null;

    let method = 'GET';
    let url = '';
    const headers: Record<string, string> = {};
    const dataParts: string[] = [];
    const formParts: string[] = [];

    for (let i = 1; i < tokens.length; i += 1) {
        const token = tokens[i];

        if (token === '-X' || token === '--request') {
            const value = nextValue(tokens, i);
            if (value) {
                method = value;
                i += 1;
            }
            continue;
        }

        if (token.startsWith('-X') && token.length > 2) {
            method = token.slice(2);
            continue;
        }

        if (token.startsWith('--request=')) {
            method = token.slice('--request='.length);
            continue;
        }

        if (token === '-H' || token === '--header') {
            const value = nextValue(tokens, i);
            if (value) {
                const parsedHeader = parseHeader(value);
                if (parsedHeader) headers[parsedHeader.key] = parsedHeader.value;
                i += 1;
            }
            continue;
        }

        if (token.startsWith('-H') && token.length > 2) {
            const parsedHeader = parseHeader(token.slice(2));
            if (parsedHeader) headers[parsedHeader.key] = parsedHeader.value;
            continue;
        }

        if (
            token === '-d' ||
            token === '--data' ||
            token === '--data-raw' ||
            token === '--data-binary'
        ) {
            const value = nextValue(tokens, i);
            if (value !== null) {
                dataParts.push(value);
                i += 1;
            }
            continue;
        }

        if (
            token.startsWith('--data=') ||
            token.startsWith('--data-raw=') ||
            token.startsWith('--data-binary=')
        ) {
            const idx = token.indexOf('=');
            dataParts.push(token.slice(idx + 1));
            continue;
        }

        if (token === '--url') {
            const value = nextValue(tokens, i);
            if (value) {
                url = value;
                i += 1;
            }
            continue;
        }

        if (token.startsWith('--url=')) {
            url = token.slice('--url='.length);
            continue;
        }

        if (token === '-F' || token === '--form') {
            const value = nextValue(tokens, i);
            if (value !== null) {
                formParts.push(value);
                i += 1;
            }
            continue;
        }

        if (token.startsWith('-F') && token.length > 2) {
            formParts.push(token.slice(2));
            continue;
        }

        if (token.startsWith('--form=')) {
            formParts.push(token.slice('--form='.length));
            continue;
        }

        if (!token.startsWith('-') && !url && /^https?:\/\//i.test(token)) {
            url = token;
        }
    }

    if (!url) return null;

    if (dataParts.length > 0 && method.toUpperCase() === 'GET') {
        method = 'POST';
    }

    if (formParts.length > 0 && method.toUpperCase() === 'GET') {
        method = 'POST';
    }

    if (formParts.length > 0) {
        const multipartFields: FormDataField[] = formParts.map((part) => {
            const eqIdx = part.indexOf('=');
            if (eqIdx <= 0) {
                return {
                    id: Math.random().toString(36).slice(2),
                    key: part,
                    value: '',
                    type: 'text',
                    enabled: true,
                };
            }
            const key = part.slice(0, eqIdx);
            const raw = part.slice(eqIdx + 1);
            const isFile = raw.startsWith('@');
            return {
                id: Math.random().toString(36).slice(2),
                key,
                value: isFile ? raw.slice(1) : raw,
                type: isFile ? 'file' : 'text',
                enabled: true,
            };
        });

        return {
            method: normalizeMethod(method),
            url,
            headers,
            multipartFields,
        };
    }

    return {
        method: normalizeMethod(method),
        url,
        headers,
        data: dataParts.length > 0 ? dataParts.join('&') : undefined,
    };
}

function shellEscape(value: string): string {
    if (/^[a-zA-Z0-9._\-/:@=&?%+~#]+$/.test(value)) return value;
    return `'${value.replace(/'/g, "'\\''")}'`;
}

interface BuildCurlOptions {
    method: string;
    url: string;
    params: { key: string; value: string; enabled: boolean }[];
    headers: { key: string; value: string; enabled: boolean }[];
    bodyType: string;
    body: string;
    formBody: { key: string; value: string; enabled: boolean }[];
    multipartBody: { key: string; value: string; type: 'text' | 'file'; enabled: boolean }[];
    auth: import('../types').Auth;
}

export function buildCurlCommand(opts: BuildCurlOptions): string {
    const parts: string[] = ['curl'];

    if (opts.method !== 'GET') {
        parts.push('-X', opts.method);
    }

    const targetUrl = new URL(opts.url.trim());
    opts.params
        .filter((p) => p.enabled && p.key)
        .forEach((p) => targetUrl.searchParams.append(p.key, p.value));

    if (opts.auth.type === 'api-key' && opts.auth.addTo === 'query' && opts.auth.key) {
        targetUrl.searchParams.append(opts.auth.key, opts.auth.value);
    }

    parts.push(shellEscape(targetUrl.toString()));

    const reqHeaders: { key: string; value: string }[] = [];

    opts.headers
        .filter((h) => h.enabled && h.key)
        .forEach((h) => reqHeaders.push({ key: h.key, value: h.value }));

    if (opts.auth.type === 'bearer' && opts.auth.token) {
        const prefix = opts.auth.prefix || 'Bearer';
        reqHeaders.push({ key: 'Authorization', value: `${prefix} ${opts.auth.token}` });
    } else if (opts.auth.type === 'basic' && (opts.auth.username || opts.auth.password)) {
        const encoded = btoa(`${opts.auth.username}:${opts.auth.password}`);
        reqHeaders.push({ key: 'Authorization', value: `Basic ${encoded}` });
    } else if (opts.auth.type === 'api-key' && opts.auth.addTo === 'header' && opts.auth.key) {
        reqHeaders.push({ key: opts.auth.key, value: opts.auth.value });
    }

    let reqData: string | undefined;

    if (opts.method !== 'GET' && opts.bodyType !== 'none') {
        if (opts.bodyType === 'json') {
            reqData = opts.body;
            if (!reqHeaders.some((h) => h.key.toLowerCase() === 'content-type')) {
                reqHeaders.push({ key: 'Content-Type', value: 'application/json' });
            }
        } else if (opts.bodyType === 'xml') {
            reqData = opts.body;
            if (!reqHeaders.some((h) => h.key.toLowerCase() === 'content-type')) {
                reqHeaders.push({ key: 'Content-Type', value: 'application/xml' });
            }
        } else if (opts.bodyType === 'text') {
            reqData = opts.body;
            if (!reqHeaders.some((h) => h.key.toLowerCase() === 'content-type')) {
                reqHeaders.push({ key: 'Content-Type', value: 'text/plain' });
            }
        } else if (opts.bodyType === 'form') {
            const fd = new URLSearchParams();
            opts.formBody
                .filter((f) => f.enabled && f.key)
                .forEach((f) => fd.append(f.key, f.value));
            reqData = fd.toString();
            if (!reqHeaders.some((h) => h.key.toLowerCase() === 'content-type')) {
                reqHeaders.push({
                    key: 'Content-Type',
                    value: 'application/x-www-form-urlencoded',
                });
            }
        }
    }

    reqHeaders.forEach((h) => {
        parts.push('-H', shellEscape(`${h.key}: ${h.value}`));
    });

    if (reqData) {
        parts.push('-d', shellEscape(reqData));
    }

    if (opts.bodyType === 'multipart' && opts.method !== 'GET') {
        opts.multipartBody
            .filter((f) => f.enabled && f.key)
            .forEach((f) => {
                const val = f.type === 'file' ? `@${f.value || 'path/to/file'}` : f.value;
                parts.push('-F', shellEscape(`${f.key}=${val}`));
            });
    }

    return parts.join(' \\\n  ');
}
