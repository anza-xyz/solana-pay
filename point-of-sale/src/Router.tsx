import React, { FC } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { ConfirmedPage } from './components/pages/ConfirmedPage';
import { NewPage } from './components/pages/NewPage';
import { PendingPage } from './components/pages/PendingPage';
import { TransactionsPage } from './components/pages/TransactionsPage';
import { useLinkWithQuery } from './hooks/useLinkWithQuery';

// TODO: add finalized view

export const Router: FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<IndexRedirect />} />
                    <Route path="new" element={<NewPage />} />
                    <Route path="pending" element={<PendingPage />} />
                    <Route path="confirmed" element={<ConfirmedPage />} />
                    <Route path="transactions" element={<TransactionsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export const IndexRedirect: FC = () => {
    const to = useLinkWithQuery('/new');
    return <Navigate to={to} replace />;
};
