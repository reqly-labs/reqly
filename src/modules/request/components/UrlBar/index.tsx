import { HTTP_METHODS } from '@/core/constants';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/utils/cn';
import { Loader2, Send } from 'lucide-react';
import { useRequest } from '../../hooks/use-request';
import { useRequestStore } from '../../store';
import type { HttpMethod } from '../../types';
import { METHOD_BORDER_COLORS, MethodBadge } from '../MethodBadge';

export function UrlBar() {
    const { method, url, loading, setMethod, setUrl } = useRequestStore();
    const { send } = useRequest();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') send();
    };

    return (
        <div
            className={cn(
                'flex items-stretch gap-0 rounded-md border-l-[3px] border border-(--color-border) bg-(--color-surface) overflow-hidden',
                'focus-within:shadow-[0_0_0_2px_color-mix(in_oklch,var(--color-primary)_30%,transparent)]',
                'transition-shadow duration-(--transition-fast)',
                METHOD_BORDER_COLORS[method]
            )}
        >
            <Select value={method} onValueChange={(v) => setMethod(v as HttpMethod)}>
                <SelectTrigger className="w-28 border-0 rounded-none font-mono font-semibold text-xs bg-transparent shadow-none focus:ring-0 shrink-0">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {HTTP_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                            <MethodBadge method={m} />
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="w-px bg-(--color-border) shrink-0" />

            <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://api.example.com/endpoint"
                className="flex-1 border-0 rounded-none font-mono text-sm bg-transparent shadow-none focus-visible:ring-0 min-w-0"
                aria-label="Request URL"
                spellCheck={false}
            />

            <Button
                onClick={send}
                disabled={loading}
                className="rounded-none rounded-r-[calc(var(--radius-md)-1px)] px-5 gap-2 shrink-0"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Send className="h-4 w-4" />
                )}
                Send
            </Button>
        </div>
    );
}
