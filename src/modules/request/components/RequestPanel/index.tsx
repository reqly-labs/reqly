import { BODY_TYPES } from '@/core/constants';
import { CodeEditor } from '@/shared/components/ui/code-editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useRequestStore } from '../../store';
import type { BodyType } from '../../types';
import { AuthEditor } from '../AuthEditor';
import { KeyValueEditor } from '../KeyValueEditor';

export function RequestPanel() {
    const {
        params,
        headers,
        bodyType,
        body,
        formBody,
        auth,
        setParams,
        setHeaders,
        setBodyType,
        setBody,
        setFormBody,
    } = useRequestStore();

    const enabledParamsCount = params.filter((p) => p.enabled && p.key).length;
    const enabledHeadersCount = headers.filter((h) => h.enabled && h.key).length;

    return (
        <div className="flex flex-col h-full min-h-0 border border-(--color-border) rounded-md bg-(--color-surface) overflow-hidden">
            <Tabs defaultValue="params" className="flex flex-col h-full min-h-0">
                <div className="px-3 pt-2 border-b border-(--color-border) shrink-0">
                    <TabsList className="h-8 bg-transparent gap-0 p-0">
                        <TabsTrigger
                            value="params"
                            className="h-7 px-3 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-(--color-primary) data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Params
                            {enabledParamsCount > 0 && (
                                <span className="ml-1.5 text-[10px] font-mono text-muted-foreground">
                                    {enabledParamsCount}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="headers"
                            className="h-7 px-3 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-(--color-primary) data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Headers
                            {enabledHeadersCount > 0 && (
                                <span className="ml-1.5 text-[10px] font-mono text-muted-foreground">
                                    {enabledHeadersCount}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="body"
                            className="h-7 px-3 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-(--color-primary) data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Body
                        </TabsTrigger>
                        <TabsTrigger
                            value="auth"
                            className="h-7 px-3 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-(--color-primary) data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Auth
                            {auth.type !== 'none' && (
                                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-(--color-primary)" />
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="params" className="flex-1 overflow-auto p-3 m-0">
                    <KeyValueEditor
                        items={params}
                        onChange={setParams}
                        keyPlaceholder="Parameter"
                    />
                </TabsContent>

                <TabsContent value="headers" className="flex-1 overflow-auto p-3 m-0">
                    <KeyValueEditor items={headers} onChange={setHeaders} keyPlaceholder="Header" />
                </TabsContent>

                <TabsContent value="body" className="flex-1 overflow-auto p-3 m-0 space-y-3">
                    <Select value={bodyType} onValueChange={(v) => setBodyType(v as BodyType)}>
                        <SelectTrigger className="h-7 w-44 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {BODY_TYPES.map((b) => (
                                <SelectItem key={b} value={b} className="text-xs capitalize">
                                    {b === 'form' ? 'form-urlencoded' : b}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {bodyType === 'none' && (
                        <p className="text-xs text-(--color-text-subtle) py-2">
                            This request has no body.
                        </p>
                    )}

                    {(bodyType === 'json' || bodyType === 'xml' || bodyType === 'text') && (
                        <CodeEditor
                            value={body}
                            onChange={setBody}
                            language={bodyType}
                            minHeight="220px"
                        />
                    )}

                    {bodyType === 'form' && (
                        <KeyValueEditor items={formBody} onChange={setFormBody} />
                    )}
                </TabsContent>

                <TabsContent value="auth" className="flex-1 overflow-auto p-3 m-0">
                    <AuthEditor />
                </TabsContent>
            </Tabs>
        </div>
    );
}
