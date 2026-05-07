import { HTTP_METHODS } from '@/core/constants';

export interface ParsedCurl {
    method: (typeof HTTP_METHODS)[number];
    url: string;
    headers: Record<string, string>;
    data?: string;
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

        if (!token.startsWith('-') && !url && /^https?:\/\//i.test(token)) {
            url = token;
        }
    }

    if (!url) return null;

    if (dataParts.length > 0 && method.toUpperCase() === 'GET') {
        method = 'POST';
    }

    return {
        method: normalizeMethod(method),
        url,
        headers,
        data: dataParts.length > 0 ? dataParts.join('&') : undefined,
    };
}
