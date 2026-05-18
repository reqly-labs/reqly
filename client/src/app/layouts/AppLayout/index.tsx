export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen w-full overflow-hidden bg-background p-3 md:p-4">
            <main className="h-full w-full rounded-xl border border-(--color-border) bg-(--color-surface)/90 shadow-xl backdrop-blur-sm overflow-hidden">
                {children}
            </main>
        </div>
    );
}
