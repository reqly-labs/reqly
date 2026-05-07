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
import { newKV, useRequestStore } from '../../store';
import type { BodyType, HttpMethod, KV } from '../../types';
import { parseCurlCommand } from '../../utils/curl';
import { METHOD_BORDER_COLORS, MethodBadge } from '../MethodBadge';

function toKVItems(data: Record<string, string>): KV[] {
    const entries = Object.entries(data);
    if (entries.length === 0) return [newKV()];

    return entries.map(([key, value]) => ({
        id: Math.random().toString(36).slice(2),
        key,
        value,
        enabled: true,
    }));
}

function inferBodyType(contentType: string, body: string): BodyType {
    const ct = contentType.toLowerCase();

    if (ct.includes('application/json')) return 'json';
    if (ct.includes('application/xml') || ct.includes('text/xml')) return 'xml';
    if (ct.includes('application/x-www-form-urlencoded')) return 'form';
    if (!body.trim()) return 'none';

    try {
        JSON.parse(body);
        return 'json';
    } catch {
        return 'text';
    }
}

export function UrlBar() {
    const {
        method,
        url,
        loading,
        setMethod,
        setUrl,
        setHeaders,
        setBodyType,
        setBody,
        setFormBody,
    } = useRequestStore();
    const { send } = useRequest();

    const applyCurlIfNeeded = (value: string): boolean => {
        const parsed = parseCurlCommand(value);
        if (!parsed) return false;

        setMethod(parsed.method);
        setUrl(parsed.url);
        setHeaders(toKVItems(parsed.headers));

        const contentType =
            Object.entries(parsed.headers).find(([k]) => k.toLowerCase() === 'content-type')?.[1] ??
            '';
        const nextBody = parsed.data ?? '';
        const nextBodyType = inferBodyType(contentType, nextBody);

        setBodyType(nextBodyType);
        setBody(nextBodyType === 'form' ? '' : nextBody);

        if (nextBodyType === 'form' && nextBody) {
            const params = new URLSearchParams(nextBody);
            const formItems: KV[] = [];
            params.forEach((formValue, formKey) => {
                formItems.push({
                    id: Math.random().toString(36).slice(2),
                    key: formKey,
                    value: formValue,
                    enabled: true,
                });
            });
            setFormBody(formItems.length > 0 ? formItems : [newKV()]);
        } else {
            setFormBody([newKV()]);
        }

        return true;
    };

    const handleSend = () => {
        applyCurlIfNeeded(url);
        send();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text');
        if (!pasted) return;

        if (applyCurlIfNeeded(pasted)) {
            e.preventDefault();
        }
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
                onPaste={handlePaste}
                placeholder="https://api.example.com/endpoint"
                className="flex-1 border-0 rounded-none font-mono text-sm bg-transparent shadow-none focus-visible:ring-0 min-w-0"
                aria-label="Request URL"
                spellCheck={false}
            />

            <Button
                onClick={handleSend}
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
