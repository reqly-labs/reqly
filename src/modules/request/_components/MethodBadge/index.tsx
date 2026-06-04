import { cn } from '@/shared/utils/cn';
import type { HttpMethod } from '../../_types';

const METHOD_COLORS: Record<HttpMethod, string> = {
    GET: 'text-(--color-method-get)',
    POST: 'text-(--color-method-post)',
    PUT: 'text-(--color-method-put)',
    DELETE: 'text-(--color-method-delete)',
    PATCH: 'text-(--color-method-patch)',
};

const METHOD_BORDER_COLORS: Record<HttpMethod, string> = {
    GET: 'border-l-(--color-method-get)',
    POST: 'border-l-(--color-method-post)',
    PUT: 'border-l-(--color-method-put)',
    DELETE: 'border-l-(--color-method-delete)',
    PATCH: 'border-l-(--color-method-patch)',
};

interface MethodBadgeProps {
    method: HttpMethod;
    className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
    return (
        <span
            className={cn(
                'font-mono text-xs font-bold tracking-wider',
                METHOD_COLORS[method],
                className
            )}
        >
            {method}
        </span>
    );
}

export { METHOD_BORDER_COLORS };
