import { APP_NAME } from '@/core/constants';
import { useTheme } from '@/shared/lib/theme';
import { cn } from '@/shared/utils/cn';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowRight,
    Check,
    Cloud,
    Code2,
    FolderOpen,
    Globe,
    KeyRound,
    Moon,
    Star,
    Sun,
    Terminal,
    Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const REPO_URL = 'https://github.com/arturbomtempo-dev/reqly';
const MASCOT_URL =
    'https://arturbomtempo-dev.github.io/arturbomtempo-cdn/assets/images/projects/reqly/mascot.png';

function GitHubIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.579.688.481C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
    );
}

function useGitHubStars() {
    return useQuery({
        queryKey: ['github-stars'],
        queryFn: async () => {
            const res = await fetch('https://api.github.com/repos/arturbomtempo-dev/reqly');
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            return data.stargazers_count as number;
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
}

function AppPreviewMockup() {
    return (
        <div className="relative w-full rounded-xl border border-(--color-border) bg-(--color-surface) shadow-2xl overflow-hidden select-none">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-(--color-border) bg-(--color-surface-raised)/50">
                <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex items-center gap-1.5 justify-center">
                    <img
                        src={MASCOT_URL}
                        alt=""
                        className="h-4 w-4 object-contain"
                        draggable={false}
                    />
                    <span className="text-xs font-semibold text-(--color-text-subtle)">
                        {APP_NAME}
                    </span>
                </div>
                <div className="h-4 w-16" />
            </div>

            {/* Tab bar */}
            <div className="flex items-end gap-0 px-2 pt-1.5 border-b border-(--color-border) bg-(--color-surface)/60 overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-t-md bg-(--color-surface) border border-b-0 border-(--color-border) text-[11px] font-medium text-(--color-text)">
                    <span className="font-mono text-[10px] font-bold text-method-get">GET</span>
                    <span className="text-(--color-text-subtle) max-w-28 truncate">
                        api.example.com/users
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-[11px] text-(--color-text-subtle) opacity-60">
                    <span className="font-mono text-[10px] font-bold text-method-post">POST</span>
                    <span className="max-w-28 truncate">api.example.com/auth</span>
                </div>
                <span className="ml-auto px-2 py-1.5 text-sm text-(--color-text-subtle) opacity-50">
                    +
                </span>
            </div>

            {/* URL bar */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-(--color-border) bg-(--color-surface-raised)/20">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold text-method-get bg-(--color-surface-raised) border border-(--color-border)">
                    GET
                </span>
                <span className="flex-1 text-[11px] font-mono text-muted-foreground truncate">
                    https://api.example.com/users?page=1&limit=10
                </span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-(--color-primary) text-(--color-primary-fg) shrink-0">
                    Send
                </span>
            </div>

            {/* Panels */}
            <div className="flex" style={{ minHeight: '168px' }}>
                {/* Request */}
                <div className="w-[44%] border-r border-(--color-border)">
                    <div className="flex border-b border-(--color-border)">
                        {['Params', 'Headers', 'Body', 'Auth'].map((tab, i) => (
                            <span
                                key={tab}
                                className={cn(
                                    'px-2.5 py-1.5 text-[10px] cursor-default shrink-0',
                                    i === 0
                                        ? 'text-(--color-primary) border-b-2 border-(--color-primary) -mb-px font-medium'
                                        : 'text-(--color-text-subtle)'
                                )}
                            >
                                {tab}
                            </span>
                        ))}
                    </div>
                    <div className="p-3 font-mono text-[11px] space-y-2">
                        {[
                            { key: 'page', val: '"1"', enabled: true },
                            { key: 'limit', val: '"10"', enabled: true },
                            { key: 'sort', val: '"name"', enabled: false },
                        ].map(({ key, val, enabled }) => (
                            <div
                                key={key}
                                className={cn('flex items-center gap-2', !enabled && 'opacity-35')}
                            >
                                <span
                                    className={cn(
                                        'h-2 w-2 rounded-sm shrink-0',
                                        enabled ? 'bg-(--color-primary)/50' : 'bg-(--color-border)'
                                    )}
                                />
                                <span className="text-info">{key}</span>
                                <span className="text-(--color-text-subtle)">=</span>
                                <span className="text-warning">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Response */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-(--color-border) bg-(--color-surface)/30">
                        <span className="text-[10px] font-bold text-success">200 OK</span>
                        <span className="text-[10px] text-(--color-border)">·</span>
                        <span className="text-[10px] text-(--color-text-subtle)">124 ms</span>
                        <span className="text-[10px] text-(--color-border)">·</span>
                        <span className="text-[10px] text-(--color-text-subtle)">1.2 KB</span>
                    </div>
                    <div className="p-3 font-mono text-[11px] leading-relaxed">
                        <div className="text-(--color-text-subtle)">{'{'}</div>
                        <div className="pl-3">
                            <span className="text-info">"data"</span>
                            <span className="text-(--color-text-subtle)">: [</span>
                        </div>
                        <div className="pl-5 text-(--color-text-subtle)">{'{'}</div>
                        <div className="pl-7">
                            <span className="text-info">"id"</span>
                            <span className="text-(--color-text-subtle)">: </span>
                            <span className="text-success">1</span>
                            <span className="text-(--color-text-subtle)">, </span>
                            <span className="text-info">"name"</span>
                            <span className="text-(--color-text-subtle)">: </span>
                            <span className="text-warning">"Alice"</span>
                        </div>
                        <div className="pl-5 text-(--color-text-subtle)">{'}'}</div>
                        <div className="pl-3 text-(--color-text-subtle)">]</div>
                        <div className="text-(--color-text-subtle)">{'}'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LandingNav() {
    const { theme, toggle } = useTheme();
    const { data: stars } = useGitHubStars();

    return (
        <nav className="sticky top-0 z-50 border-b border-(--color-border) bg-background/80 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
                >
                    <img
                        src={MASCOT_URL}
                        alt={APP_NAME + ' logo'}
                        className="h-7 w-7 object-contain"
                        draggable={false}
                    />
                    <span className="text-base font-semibold tracking-tight text-(--color-text)">
                        {APP_NAME}
                    </span>
                </Link>

                {/* Center nav links */}
                <div className="hidden md:flex items-center gap-6">
                    <a
                        href="#features"
                        className="text-sm text-muted-foreground hover:text-(--color-text) transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="#docs"
                        className="text-sm text-muted-foreground hover:text-(--color-text) transition-colors"
                    >
                        Docs
                    </a>
                    <a
                        href={REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-(--color-text) transition-colors"
                    >
                        <GitHubIcon className="h-4 w-4" />
                        GitHub
                        {stars !== undefined && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-(--color-surface-raised) border border-(--color-border) text-(--color-text-subtle)">
                                <Star className="h-2.5 w-2.5" />
                                {stars}
                            </span>
                        )}
                    </a>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={toggle}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        className="h-8 w-8 flex items-center justify-center rounded-md text-(--color-text-subtle) hover:text-(--color-text) hover:bg-(--color-surface-hover) transition-colors cursor-pointer"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                    </button>
                    <Link
                        to="/app"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-(--color-primary) text-(--color-primary-fg) hover:bg-(--color-primary-hover) transition-colors"
                    >
                        Open App
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </nav>
    );
}

function HeroSection() {
    const { data: stars } = useGitHubStars();

    return (
        <section className="relative overflow-hidden">
            {/* Background glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-225 h-150 rounded-full blur-[160px] pointer-events-none"
                style={{ background: 'oklch(0.71 0.2 154 / 0.07)' }}
                aria-hidden
            />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 md:pt-28 md:pb-24">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Left: copy */}
                    <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
                        {/* Eyebrow */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-surface) text-xs text-muted-foreground mb-6">
                            <span
                                className="h-1.5 w-1.5 rounded-full bg-(--color-primary)"
                                style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}
                            />
                            Open source · Local-first · Developer-ready
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-(--color-text) mb-5 leading-[1.1]">
                            Build, Test, and Debug{' '}
                            <span className="text-(--color-primary)">APIs</span>
                            <br />
                            with Confidence.
                        </h1>

                        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                            A modern, lightweight HTTP client for composing requests, inspecting
                            responses, organizing collections, and syncing your workflow across
                            devices.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                            <Link
                                to="/app"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-(--color-primary) text-(--color-primary-fg) hover:bg-(--color-primary-hover) transition-colors shadow-sm w-full sm:w-auto justify-center"
                            >
                                Open App
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <a
                                href={REPO_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-(--color-border) bg-(--color-surface) text-(--color-text) hover:bg-(--color-surface-hover) transition-colors w-full sm:w-auto justify-center"
                            >
                                <GitHubIcon className="h-4 w-4" />
                                View on GitHub
                                {stars !== undefined && (
                                    <span className="flex items-center gap-1 text-[11px] text-(--color-text-subtle)">
                                        <Star className="h-3 w-3" />
                                        {stars}
                                    </span>
                                )}
                            </a>
                        </div>

                        {/* Trust signals */}
                        <div className="mt-6 flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                            {['Free forever', 'No account required', 'Open source'].map((item) => (
                                <span
                                    key={item}
                                    className="flex items-center gap-1.5 text-xs text-(--color-text-subtle)"
                                >
                                    <Check className="h-3 w-3 text-success" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right: app preview */}
                    <div className="flex-1 w-full max-w-xl lg:max-w-none">
                        <AppPreviewMockup />
                    </div>
                </div>
            </div>
        </section>
    );
}

const FEATURES = [
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

function FeaturesSection() {
    return (
        <section id="features" className="py-20 md:py-28 border-t border-(--color-border)">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-(--color-text) mb-3">
                        Everything you need to test APIs
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Reqly bundles the tools developers actually reach for, without the bloat.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FEATURES.map(({ icon: Icon, colorClass, bgStyle, title, description }) => (
                        <div
                            key={title}
                            className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface) hover:border-(--color-primary)/40 hover:bg-(--color-surface-hover) transition-all duration-200 group"
                        >
                            <div
                                className="h-10 w-10 rounded-lg flex items-center justify-center mb-4"
                                style={bgStyle}
                            >
                                <Icon className={cn('h-5 w-5', colorClass)} />
                            </div>
                            <h3 className="text-sm font-semibold text-(--color-text) mb-1.5">
                                {title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const QUICK_START_STEPS = [
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

function DocsSection() {
    return (
        <section
            id="docs"
            className="py-20 md:py-28 border-t border-(--color-border) bg-(--color-surface)/40"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-(--color-text) mb-3">
                        Get started in seconds
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        No setup required. Reqly is ready to use the moment you open it.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                    {QUICK_START_STEPS.map(({ step, title, description, ...rest }) => {
                        const { code } = rest as { code?: string };
                        const { action } = rest as {
                            action?: { label: string; href: string; internal: boolean };
                        };
                        return (
                            <div
                                key={step}
                                className="p-6 rounded-xl border border-(--color-border) bg-(--color-surface)"
                            >
                                <div className="text-4xl font-bold text-(--color-primary)/25 mb-4 font-mono leading-none">
                                    {step}
                                </div>
                                <h3 className="text-base font-semibold text-(--color-text) mb-2">
                                    {title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                    {description}
                                </p>
                                {code && (
                                    <code className="block text-[11px] font-mono px-3 py-2 rounded-md bg-(--color-surface-raised) border border-(--color-border) text-muted-foreground truncate">
                                        {code}
                                    </code>
                                )}
                                {action &&
                                    (action.internal ? (
                                        <Link
                                            to={action.href}
                                            className="inline-flex items-center gap-1.5 text-sm text-(--color-primary) hover:opacity-80 transition-opacity font-medium"
                                        >
                                            {action.label}
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    ) : (
                                        <a
                                            href={action.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-(--color-primary) hover:opacity-80 transition-opacity font-medium"
                                        >
                                            {action.label}
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </a>
                                    ))}
                            </div>
                        );
                    })}
                </div>

                {/* Local dev block */}
                <div className="p-6 rounded-xl border border-(--color-border) bg-(--color-surface)">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-(--color-surface-raised) border border-(--color-border) shrink-0">
                            <Terminal className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-(--color-text) mb-1">
                                Run locally
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                Clone the repository and run Reqly locally to test APIs on{' '}
                                <code className="font-mono text-xs text-(--color-text) bg-(--color-surface-raised) px-1 py-0.5 rounded border border-(--color-border)">
                                    localhost
                                </code>
                                . The Vite dev proxy forwards requests that are otherwise blocked in
                                the hosted version.
                            </p>
                            <div className="rounded-lg border border-(--color-border) bg-(--color-surface-raised) overflow-hidden">
                                <div className="flex items-center gap-2 px-3 py-2 border-b border-(--color-border)">
                                    <span className="h-2 w-2 rounded-full bg-(--color-border)" />
                                    <span className="h-2 w-2 rounded-full bg-(--color-border)" />
                                    <span className="h-2 w-2 rounded-full bg-(--color-border)" />
                                    <span className="ml-1 text-[11px] text-(--color-text-subtle) font-mono">
                                        terminal
                                    </span>
                                </div>
                                <div className="p-4 font-mono text-[12px] space-y-1.5 text-muted-foreground">
                                    <div>
                                        <span className="text-success">$</span> git clone {REPO_URL}
                                    </div>
                                    <div>
                                        <span className="text-success">$</span> cd reqly/client
                                        &amp;&amp; npm install
                                    </div>
                                    <div>
                                        <span className="text-success">$</span> npm run dev
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function OpenSourceSection() {
    const { data: stars } = useGitHubStars();

    return (
        <section className="py-20 md:py-28 border-t border-(--color-border) relative overflow-hidden">
            {/* Background glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 50% at 50% 100%, oklch(0.71 0.2 154 / 0.06), transparent)',
                }}
                aria-hidden
            />
            <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-(--color-surface-raised) border border-(--color-border) mb-6 mx-auto">
                    <GitHubIcon className="h-7 w-7 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-bold text-(--color-text) mb-3">Built in the open</h2>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    Reqly is fully open source under the MIT license. Explore the code, report
                    issues, or contribute on GitHub.
                </p>

                <div className="flex flex-wrap items-center gap-3 justify-center">
                    <a
                        href={REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-(--color-surface) border border-(--color-border) text-(--color-text) hover:bg-(--color-surface-hover) transition-colors"
                    >
                        <GitHubIcon className="h-4 w-4" />
                        Star on GitHub
                        {stars !== undefined && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-(--color-surface-raised) border border-(--color-border) text-(--color-text-subtle)">
                                <Star className="h-2.5 w-2.5" />
                                {stars}
                            </span>
                        )}
                    </a>
                    <a
                        href={`${REPO_URL}/issues`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-(--color-border) text-muted-foreground hover:text-(--color-text) hover:bg-(--color-surface-hover) transition-colors"
                    >
                        Open an Issue
                        <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                    <Link
                        to="/app"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-(--color-primary) text-(--color-primary-fg) hover:bg-(--color-primary-hover) transition-colors"
                    >
                        Open App
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

function LandingFooter() {
    return (
        <footer className="border-t border-(--color-border) py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <img
                        src={MASCOT_URL}
                        alt=""
                        className="h-5 w-5 object-contain"
                        draggable={false}
                    />
                    <span className="text-sm font-semibold text-(--color-text)">{APP_NAME}</span>
                    <span className="text-sm text-(--color-text-subtle) hidden sm:inline">
                        — Fast and practical HTTP client for developers.
                    </span>
                </div>

                <div className="flex items-center gap-5 text-sm text-(--color-text-subtle)">
                    <a
                        href={REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-(--color-text) transition-colors"
                    >
                        GitHub
                    </a>
                    <a
                        href={`${REPO_URL}#readme`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-(--color-text) transition-colors"
                    >
                        Docs
                    </a>
                    <a
                        href={`${REPO_URL}/issues`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-(--color-text) transition-colors"
                    >
                        Issues
                    </a>
                    <span className="text-(--color-border)">·</span>
                    <span>MIT License</span>
                </div>
            </div>
        </footer>
    );
}

export function Home() {
    return (
        <div className="min-h-screen bg-background text-(--color-text)">
            <LandingNav />
            <HeroSection />
            <FeaturesSection />
            <DocsSection />
            <OpenSourceSection />
            <LandingFooter />
        </div>
    );
}
