import { REPO_URL } from '@/core/constants';
import { ArrowRight, Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGitHubStars } from '../../_hooks/use-github-stars';
import { AppPreviewMockup } from '../AppPreviewMockup';
import { GitHubIcon } from '../GitHubIcon';

export function HeroSection() {
    const { data: stars } = useGitHubStars();

    return (
        <section className="relative overflow-hidden">
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-225 h-150 rounded-full blur-[160px] pointer-events-none"
                style={{ background: 'oklch(0.71 0.2 154 / 0.07)' }}
                aria-hidden
            />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 md:pt-28 md:pb-24">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
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

                    <div className="flex-1 w-full max-w-xl lg:max-w-none">
                        <AppPreviewMockup />
                    </div>
                </div>
            </div>
        </section>
    );
}
