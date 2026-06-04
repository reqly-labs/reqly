import { QUICK_START_STEPS, REPO_URL } from '@/core/constants';
import { ArrowRight, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DocsSection() {
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
