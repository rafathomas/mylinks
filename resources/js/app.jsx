import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import MyLinksDashboard from './MyLinksDashboard';

const container = document.getElementById('app');

if (container && container.dataset.component === 'dashboard') {
    const payload = container.dataset.page ? JSON.parse(container.dataset.page) : {};

    createRoot(container).render(
        <React.StrictMode>
            <MyLinksDashboard initialData={payload} />
        </React.StrictMode>,
    );
}
