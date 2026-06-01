import { APP_NAME, MASCOT_URL, REPO_URL } from '@/core/constants';
import { useTheme } from '@/shared/lib/use-theme';
import { ArrowRight, Moon, Star, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGitHubStars } from '../../_hooks/use-github-stars';
import { GitHubIcon } from '../GitHubIcon';

export function LandingNav() {
    const { theme, toggle } = useTheme();
    const { data: stars } = useGitHubStars();

    return (
        <nav className="sticky top-0 z-50 border-b border-(--color-border) bg-background/80 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
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
