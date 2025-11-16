import React, { ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MarketplaceBrowsePage } from './pages/marketplace/MarketplaceBrowsePage';
import { MyProductsPage } from './pages/seller/MyProductsPage';
import { DeliveryTrackingPage } from './pages/delivery/DeliveryTrackingPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { MainLayout } from './components/layout/MainLayout';
import { UserRole } from './types';
import { CartProvider } from './contexts/CartContext';
import { InventoryPage } from './pages/seller/InventoryPage';
import { SettingsProvider } from './contexts/SettingsContext';
import { SettingsPage } from './pages/admin/SettingsPage';

const ProtectedRoute: React.FC<{ roles?: UserRole[], children?: ReactNode }> = ({ roles, children }) => {
    const { isAuthenticated, user, loading } = useAuth();
    
    if (loading) {
        return <div className="flex h-screen items-center justify-center">A carregar...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (roles && user && !roles.includes(user.role)) {
        return <Navigate to="/" replace />; // Or a specific "access denied" page
    }

    return children ? <>{children}</> : <Outlet />;
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">A carregar...</div>;
    }

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />

            <Route path="/" element={<ProtectedRoute><MainLayout><Outlet /></MainLayout></ProtectedRoute>}>
                <Route index element={<DashboardPage />} />
                <Route path="comprar" element={<MarketplaceBrowsePage />} />
                <Route path="entregas" element={<DeliveryTrackingPage />} />
                
                <Route path="vender" element={<ProtectedRoute roles={[UserRole.SELLER, UserRole.MANAGER, UserRole.ADMIN]} />}>
                   <Route path="produtos" element={<MyProductsPage />} />
                   <Route path="inventario" element={<InventoryPage />} />
                </Route>

                <Route path="admin" element={<ProtectedRoute roles={[UserRole.ADMIN]} />}>
                   <Route path="usuarios" element={<UserManagementPage />} />
                   <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Route>
            
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <SettingsProvider>
                <CartProvider>
                    <HashRouter>
                        <AppRoutes />
                    </HashRouter>
                </CartProvider>
            </SettingsProvider>
        </AuthProvider>
    );
};

export default App;