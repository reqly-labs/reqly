import { AppLayout } from '@/app/_layouts/AppLayout';
import { AppProviders } from '@/app/_providers';
import { NotFoundPage } from '@/app/pages/NotFound';
import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const RequestModule = lazy(async () => {
    const module = await import('@/modules/request');
    return { default: module.RequestModule };
});

export function App() {
    return (
        <AppProviders>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <AppLayout>
                                <Suspense fallback={null}>
                                    <RequestModule />
                                </Suspense>
                            </AppLayout>
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </BrowserRouter>
        </AppProviders>
    );
}
