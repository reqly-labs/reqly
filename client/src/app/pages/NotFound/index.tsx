export function NotFoundPage() {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-2">
                <p className="font-mono text-4xl font-bold text-(--color-text-subtle)">404</p>
                <p className="text-sm text-muted-foreground">Page not found</p>
            </div>
        </div>
    );
}
