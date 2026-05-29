import { AppLayout } from '@/app/_layouts/AppLayout';
import { AppProviders } from '@/app/_providers';
import { Home } from '@/app/pages/Home';
import { NotFoundPage } from '@/app/pages/NotFound';
import { RequestModule } from '@/modules/request';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

export function App() {
    return (
        <AppProviders>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/app"
                        element={
                            <AppLayout>
                                <RequestModule />
                            </AppLayout>
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </BrowserRouter>
        </AppProviders>
    );
}
