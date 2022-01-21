import React, { FC } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { ConfirmedPage } from './pages/ConfirmedPage';
import { NewPage } from './pages/NewPage';
import { PendingPage } from './pages/PendingPage';
import { TransactionsPage } from './pages/TransactionsPage';

// TODO: add finalized view

export const Router: FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/:config" element={<App />}>
                    <Route index element={<Navigate replace to="new" />} />
                    <Route path="new" element={<NewPage />} />
                    <Route path="pending" element={<PendingPage />} />
                    <Route path="confirmed" element={<ConfirmedPage />} />
                    <Route path="transactions" element={<TransactionsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};
