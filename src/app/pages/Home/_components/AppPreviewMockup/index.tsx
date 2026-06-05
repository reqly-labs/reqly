import { APP_NAME, MASCOT_URL } from '@/core/constants';
import { cn } from '@/shared/utils/cn';

export function AppPreviewMockup() {
    return (
        <div className="relative w-full rounded-xl border border-(--color-border) bg-(--color-surface) shadow-2xl overflow-hidden select-none">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-(--color-border) bg-(--color-surface-raised)/50">
                <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                    <span className="h-2.5 w-2.5 rounded-full bg-success" />
                </div>
                <div className="flex-1 flex items-center gap-1.5 justify-center">
                    <img
                        src={MASCOT_URL}
                        alt=""
                        className="h-4 w-4 object-contain"
                        draggable={false}
                    />
                    <span className="text-xs font-semibold text-(--color-text-subtle)">
                        {APP_NAME}
                    </span>
                </div>
                <div className="h-4 w-16" />
            </div>

            <div className="flex items-end gap-0 px-2 pt-1.5 border-b border-(--color-border) bg-(--color-surface)/60 overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-t-md bg-(--color-surface) border border-b-0 border-(--color-border) text-[11px] font-medium text-(--color-text)">
                    <span className="font-mono text-[10px] font-bold text-method-get">GET</span>
                    <span className="text-(--color-text-subtle) max-w-28 truncate">
                        api.example.com/users
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-[11px] text-(--color-text-subtle) opacity-60">
                    <span className="font-mono text-[10px] font-bold text-method-post">POST</span>
                    <span className="max-w-28 truncate">api.example.com/auth</span>
                </div>
                <span className="ml-auto px-2 py-1.5 text-sm text-(--color-text-subtle) opacity-50">
                    +
                </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-(--color-border) bg-(--color-surface-raised)/20">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold text-method-get bg-(--color-surface-raised) border border-(--color-border)">
                    GET
                </span>
                <span className="flex-1 text-[11px] font-mono text-muted-foreground truncate">
                    https://api.example.com/users?page=1&limit=10
                </span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-(--color-primary) text-(--color-primary-fg) shrink-0">
                    Send
                </span>
            </div>

            <div className="flex" style={{ minHeight: '168px' }}>
                <div className="w-[44%] border-r border-(--color-border)">
                    <div className="flex border-b border-(--color-border)">
                        {['Params', 'Headers', 'Body', 'Auth'].map((tab, i) => (
                            <span
                                key={tab}
                                className={cn(
                                    'px-2.5 py-1.5 text-[10px] cursor-default shrink-0',
                                    i === 0
                                        ? 'text-(--color-primary) border-b-2 border-(--color-primary) -mb-px font-medium'
                                        : 'text-(--color-text-subtle)'
                                )}
                            >
                                {tab}
                            </span>
                        ))}
                    </div>
                    <div className="p-3 font-mono text-[11px] space-y-2">
                        {[
                            { key: 'page', val: '"1"', enabled: true },
                            { key: 'limit', val: '"10"', enabled: true },
                            { key: 'sort', val: '"name"', enabled: false },
                        ].map(({ key, val, enabled }) => (
                            <div
                                key={key}
                                className={cn('flex items-center gap-2', !enabled && 'opacity-35')}
                            >
                                <span
                                    className={cn(
                                        'h-2 w-2 rounded-sm shrink-0',
                                        enabled ? 'bg-(--color-primary)/50' : 'bg-(--color-border)'
                                    )}
                                />
                                <span className="text-info">{key}</span>
                                <span className="text-(--color-text-subtle)">=</span>
                                <span className="text-warning">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-(--color-border) bg-(--color-surface)/30">
                        <span className="text-[10px] font-bold text-success">200 OK</span>
                        <span className="text-[10px] text-(--color-border)">·</span>
                        <span className="text-[10px] text-(--color-text-subtle)">124 ms</span>
                        <span className="text-[10px] text-(--color-border)">·</span>
                        <span className="text-[10px] text-(--color-text-subtle)">1.2 KB</span>
                    </div>
                    <div className="p-3 font-mono text-[11px] leading-relaxed">
                        <div className="text-(--color-text-subtle)">{'{'}</div>
                        <div className="pl-3">
                            <span className="text-info">"data"</span>
                            <span className="text-(--color-text-subtle)">: [</span>
                        </div>
                        <div className="pl-5 text-(--color-text-subtle)">{'{'}</div>
                        <div className="pl-7">
                            <span className="text-info">"id"</span>
                            <span className="text-(--color-text-subtle)">: </span>
                            <span className="text-success">1</span>
                            <span className="text-(--color-text-subtle)">, </span>
                            <span className="text-info">"name"</span>
                            <span className="text-(--color-text-subtle)">: </span>
                            <span className="text-warning">"Alice"</span>
                        </div>
                        <div className="pl-5 text-(--color-text-subtle)">{'}'}</div>
                        <div className="pl-3 text-(--color-text-subtle)">]</div>
                        <div className="text-(--color-text-subtle)">{'}'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
