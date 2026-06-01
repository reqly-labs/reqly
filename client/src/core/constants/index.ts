import { Cloud, Code2, FolderOpen, Globe, KeyRound, Zap } from 'lucide-react';

export const APP_NAME = 'Reqly';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = 'A modern, lightweight HTTP client for developers.';
export const APP_REPO = 'https://github.com/arturbomtempo/reqly';

export const DEFAULT_REQUEST_TIMEOUT = 30_000;

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
export const BODY_TYPES = ['none', 'json', 'text', 'xml', 'form', 'multipart'] as const;
export const AUTH_TYPES = ['none', 'bearer', 'basic', 'api-key'] as const;

export const SIDEBAR_MIN_WIDTH = 180;
export const SIDEBAR_MAX_WIDTH = 520;
export const SIDEBAR_DEFAULT_WIDTH = 256;
export const SIDEBAR_WIDTH_STORAGE_KEY = 'reqly:sidebar-width';

export const REPO_URL = 'https://github.com/arturbomtempo-dev/reqly';
export const MASCOT_URL =
    'https://arturbomtempo-dev.github.io/arturbomtempo-cdn/assets/images/projects/reqly/mascot.png';

export const FEATURES = [
    {
        icon: Globe,
        colorClass: 'text-info',
        bgStyle: { background: 'oklch(0.55 0.16 230 / 0.12)' },
        title: 'HTTP Request Builder',
        description:
            'Compose any HTTP request with full control over params, headers, body formats, and authentication.',
    },
    {
        icon: Zap,
        colorClass: 'text-warning',
        bgStyle: { background: 'oklch(0.6 0.16 75 / 0.12)' },
        title: 'Response Inspector',
        description:
            'Analyze responses with status codes, timing, size breakdowns, formatted bodies, and image previews.',
    },
    {
        icon: FolderOpen,
        colorClass: 'text-(--color-primary)',
        bgStyle: { background: 'oklch(0.71 0.2 154 / 0.12)' },
        title: 'Collections & Folders',
        description:
            'Organize saved requests into named collections and nested folders for a clean, searchable workspace.',
    },
    {
        icon: Code2,
        colorClass: 'text-success',
        bgStyle: { background: 'oklch(0.55 0.17 152 / 0.12)' },
        title: 'cURL Import & Export',
        description:
            'Paste any cURL command to instantly populate a request, or copy your current request as cURL.',
    },
    {
        icon: KeyRound,
        colorClass: 'text-(--color-danger)',
        bgStyle: { background: 'oklch(0.55 0.22 25 / 0.12)' },
        title: 'Auth Support',
        description:
            'Bearer token, Basic auth, and API Key authentication built-in — no plugins or extensions needed.',
    },
    {
        icon: Cloud,
        colorClass: 'text-(--color-method-put)',
        bgStyle: { background: 'oklch(0.52 0.16 230 / 0.12)' },
        title: 'Cloud Sync',
        description:
            'Sign in with Google to sync your collections across all browsers and devices, automatically.',
    },
] as const;

export const QUICK_START_STEPS = [
    {
        step: '01',
        title: 'Open the app',
        description:
            'Launch Reqly directly in your browser — no installation needed. Or run it locally for full localhost support.',
        action: { label: 'Open App', href: '/app', internal: true as const },
    },
    {
        step: '02',
        title: 'Compose a request',
        description:
            'Enter your URL, select an HTTP method, add params, headers, or a request body. Hit Send and inspect the response instantly.',
        code: 'GET https://api.example.com/users',
    },
    {
        step: '03',
        title: 'Save & organize',
        description:
            'Save requests into collections and folders. Sign in with Google to sync everything across all your devices.',
        action: { label: 'Read the README', href: `${REPO_URL}#readme`, internal: false as const },
    },
] as const;
