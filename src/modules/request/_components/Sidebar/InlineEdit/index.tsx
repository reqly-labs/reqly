import { cn } from '@/shared/utils/cn';
import { useEffect, useRef, useState } from 'react';

interface InlineEditProps {
    value: string;
    onCommit: (value: string) => void;
    onCancel: () => void;
    className?: string;
}

export function InlineEdit({ value, onCommit, onCancel, className }: InlineEditProps) {
    const [text, setText] = useState(value);
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        ref.current?.select();
    }, []);

    const commit = () => {
        if (text.trim()) onCommit(text.trim());
        else onCancel();
    };

    return (
        <input
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') onCancel();
                e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
                'min-w-0 w-full bg-transparent outline-none border-b border-(--color-primary) text-xs text-(--color-text)',
                className
            )}
        />
    );
}
