import { AUTH_TYPES } from '@/core/constants';
import { Input } from '@/shared/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Eye, EyeOff, Info } from 'lucide-react';
import { useState } from 'react';
import { useRequestStore } from '../../store';
import type { Auth, AuthApiKey, AuthBasic, AuthBearer, AuthType } from '../../types';

const AUTH_LABELS: Record<AuthType, string> = {
    none: 'No Auth',
    bearer: 'Bearer Token',
    basic: 'Basic Auth',
    'api-key': 'API Key',
};

function defaultAuth(type: AuthType): Auth {
    switch (type) {
        case 'bearer':
            return { type: 'bearer', token: '', prefix: 'Bearer' };
        case 'basic':
            return { type: 'basic', username: '', password: '' };
        case 'api-key':
            return { type: 'api-key', key: '', value: '', addTo: 'header' };
        default:
            return { type: 'none' };
    }
}

function MaskedInput({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <Input
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="font-mono text-xs h-8 pr-8"
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-text-subtle) hover:text-(--color-text) transition-colors"
                aria-label={visible ? 'Hide value' : 'Show value'}
            >
                {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
        </div>
    );
}

function BearerEditor({ auth, onUpdate }: { auth: AuthBearer; onUpdate: (a: Auth) => void }) {
    return (
        <div className="space-y-3">
            <Field label="Prefix">
                <Input
                    value={auth.prefix}
                    onChange={(e) => onUpdate({ ...auth, prefix: e.target.value })}
                    placeholder="Bearer"
                    className="font-mono text-xs h-8"
                />
            </Field>
            <Field label="Token">
                <MaskedInput
                    value={auth.token}
                    onChange={(token) => onUpdate({ ...auth, token })}
                    placeholder="your-access-token"
                />
            </Field>
            <AuthHint>
                The token will be sent as{' '}
                <code className="text-[11px] font-mono px-1 py-0.5 rounded bg-(--color-surface-raised)">
                    {auth.prefix || 'Bearer'} &lt;token&gt;
                </code>{' '}
                in the Authorization header.
            </AuthHint>
        </div>
    );
}

function BasicEditor({ auth, onUpdate }: { auth: AuthBasic; onUpdate: (a: Auth) => void }) {
    return (
        <div className="space-y-3">
            <Field label="Username">
                <Input
                    value={auth.username}
                    onChange={(e) => onUpdate({ ...auth, username: e.target.value })}
                    placeholder="username"
                    className="font-mono text-xs h-8"
                />
            </Field>
            <Field label="Password">
                <MaskedInput
                    value={auth.password}
                    onChange={(password) => onUpdate({ ...auth, password })}
                    placeholder="password"
                />
            </Field>
            <AuthHint>
                Credentials will be Base64-encoded and sent as{' '}
                <code className="text-[11px] font-mono px-1 py-0.5 rounded bg-(--color-surface-raised)">
                    Basic &lt;base64&gt;
                </code>{' '}
                in the Authorization header.
            </AuthHint>
        </div>
    );
}

function ApiKeyEditor({ auth, onUpdate }: { auth: AuthApiKey; onUpdate: (a: Auth) => void }) {
    return (
        <div className="space-y-3">
            <Field label="Key">
                <Input
                    value={auth.key}
                    onChange={(e) => onUpdate({ ...auth, key: e.target.value })}
                    placeholder="X-API-Key"
                    className="font-mono text-xs h-8"
                />
            </Field>
            <Field label="Value">
                <MaskedInput
                    value={auth.value}
                    onChange={(value) => onUpdate({ ...auth, value })}
                    placeholder="your-api-key"
                />
            </Field>
            <Field label="Add to">
                <Select
                    value={auth.addTo}
                    onValueChange={(v) => onUpdate({ ...auth, addTo: v as 'header' | 'query' })}
                >
                    <SelectTrigger className="h-8 w-44 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="header" className="text-xs">
                            Header
                        </SelectItem>
                        <SelectItem value="query" className="text-xs">
                            Query Param
                        </SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <AuthHint>
                The key-value pair will be added to the request{' '}
                {auth.addTo === 'header' ? 'headers' : 'query parameters'}.
            </AuthHint>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-(--color-text-subtle)">{label}</label>
            {children}
        </div>
    );
}

function AuthHint({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-2 rounded-md bg-(--color-surface-raised)/60 px-3 py-2.5 border border-(--color-border-subtle)">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-(--color-text-subtle)" />
            <p className="text-[11px] leading-relaxed text-(--color-text-subtle)">{children}</p>
        </div>
    );
}

export function AuthEditor() {
    const { auth, setAuth } = useRequestStore();

    const handleTypeChange = (type: AuthType) => {
        if (type === auth.type) return;
        setAuth(defaultAuth(type));
    };

    return (
        <div className="space-y-4">
            <Select value={auth.type} onValueChange={(v) => handleTypeChange(v as AuthType)}>
                <SelectTrigger className="h-8 w-52 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {AUTH_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                            {AUTH_LABELS[t]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {auth.type === 'none' && (
                <p className="text-xs text-(--color-text-subtle) py-2">
                    This request has no authentication.
                </p>
            )}

            {auth.type === 'bearer' && <BearerEditor auth={auth} onUpdate={setAuth} />}
            {auth.type === 'basic' && <BasicEditor auth={auth} onUpdate={setAuth} />}
            {auth.type === 'api-key' && <ApiKeyEditor auth={auth} onUpdate={setAuth} />}
        </div>
    );
}
