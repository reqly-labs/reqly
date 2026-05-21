import { AppLayout } from '@/app/layouts/AppLayout';
import { NotFoundPage } from '@/app/pages/NotFound';
import { AppProviders } from '@/app/providers';
import { RequestModule } from '@/modules/request';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

export function App() {
    return (
        <AppProviders>
            <BrowserRouter>
                <AppLayout>
                    <Routes>
                        <Route path="/" element={<RequestModule />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </AppLayout>
            </BrowserRouter>
        </AppProviders>
    );
}
