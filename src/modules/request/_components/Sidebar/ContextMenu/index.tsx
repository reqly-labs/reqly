import { cn } from '@/shared/utils/cn';
import { useEffect, useRef } from 'react';

interface ContextMenuProps {
    items: {
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        onClick: () => void;
        destructive?: boolean;
    }[];
    position: { x: number; y: number };
    onClose: () => void;
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="fixed z-50 min-w-40 rounded-md border border-(--color-border) bg-popover text-popover-foreground shadow-md py-1 animate-in fade-in-0 zoom-in-95"
            style={{ top: position.y, left: position.x }}
        >
            {items.map((item) => (
                <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                        item.onClick();
                        onClose();
                    }}
                    className={cn(
                        'flex w-full items-center gap-2.5 px-3 py-1.5 text-xs transition-colors cursor-pointer',
                        item.destructive
                            ? 'text-destructive hover:bg-destructive/10'
                            : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                </button>
            ))}
        </div>
    );
}
