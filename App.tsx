import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import RemitoFormPage from './pages/RemitoFormPage';
import RemitoDetailPage from './pages/RemitoDetailPage';
import Layout from './components/layout/Layout';
import { View } from './types';
import ToastProvider from './components/ui/Toast';

const AppContent: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<View>({ page: 'dashboard' });

    const CurrentPage = useMemo(() => {
        switch (view.page) {
            case 'dashboard':
                return <DashboardPage setView={setView} />;
            case 'remito_new':
                return <RemitoFormPage setView={setView} />;
            case 'remito_edit':
                return <RemitoFormPage setView={setView} remitoId={view.id} />;
            case 'remito_detail':
                return <RemitoDetailPage setView={setView} remitoId={view.id!} />;
            case 'admin':
                return <AdminPage setView={setView} />;
            default:
                return <DashboardPage setView={setView} />;
        }
    }, [view]);

    if (!user) {
        return <LoginPage />;
    }

    return (
        <Layout setView={setView}>
            {CurrentPage}
        </Layout>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <ToastProvider>
                <AppContent />
            </ToastProvider>
        </AuthProvider>
    );
};

export default App;
