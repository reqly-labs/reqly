import { FEATURES } from '@/core/constants';
import { cn } from '@/shared/utils/cn';

export function FeaturesSection() {
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
                    {FEATURES.map(({ icon: Icon, colorClass, bgClass, title, description }) => (
                        <div
                            key={title}
                            className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface) hover:border-(--color-primary)/40 hover:bg-(--color-surface-hover) transition-all duration-200 group"
                        >
                            <div
                                className={cn(
                                    'h-10 w-10 rounded-lg flex items-center justify-center mb-4',
                                    bgClass
                                )}
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
