import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { injectDesignSystemStyles } from './shared/lib/design-system';
import './styles/globals.css';

injectDesignSystemStyles();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
