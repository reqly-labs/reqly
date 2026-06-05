import { REPO_URL } from '@/core/constants';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGitHubStars } from '../../_hooks/use-github-stars';
import { GitHubIcon } from '../GitHubIcon';

export function OpenSourceSection() {
    const { data: stars } = useGitHubStars();

    const openSourceGlowStyle = {
        background:
            'radial-gradient(ellipse 60% 50% at 50% 100%, color-mix(in oklch, var(--color-primary) 12%, transparent), transparent)',
    };

    return (
        <section className="py-20 md:py-28 border-t border-(--color-border) relative overflow-hidden">
            <div
                className="absolute inset-0 pointer-events-none"
                style={openSourceGlowStyle}
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
