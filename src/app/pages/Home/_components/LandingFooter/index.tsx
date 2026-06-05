import { APP_DESCRIPTION, APP_NAME, MASCOT_URL, REPO_URL } from '@/core/constants';

export function LandingFooter() {
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
                        — {APP_DESCRIPTION}
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
