import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import WaiterHome from '../pages/waiter/WaiterHome';
import WaiterDashboard from '../pages/waiter/WaiterDashboard';
import ReadyOrders from '../pages/waiter/ReadyOrders';
import KitchenDashboard from '../pages/kitchen/KitchenDashboard';
import KitchenHistory from '../pages/kitchen/KitchenHistory';
import ClientReservation from '../pages/client/ClientReservation';
import ClientTableView from '../pages/client/ClientTableView';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminMenu from '../pages/admin/AdminMenu';
import AdminReports from '../pages/admin/AdminReports';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminInventory from '../pages/admin/AdminInventory';
import CashierDashboard from '../pages/cashier/CashierDashboard';
import CashierClosing from '../pages/cashier/CashierClosing';
import PlaceholderPage from '../pages/PlaceholderPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#080809] flex items-center justify-center text-amber-500">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// Componente para mostrar dashboard según rol
const RoleDashboard = () => {
  const { user } = useAuth();
  
  // Redirigir a dashboard específico según rol
  switch (user?.role) {
    case 'waiter':
      return <WaiterHome />;
    case 'kitchen':
      return <KitchenDashboard />;
    case 'cashier':
      return <CashierDashboard />;
    case 'client':
      return <ClientReservation />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Dashboard />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Ruta PÚBLICA para cliente (QR de mesa) */}
      <Route path="/table/:tableNumber" element={<ClientTableView />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<RoleDashboard />} />
        {/* Rutas específicas de mesero */}
        <Route path="order" element={<WaiterDashboard />} />
        <Route path="ready" element={<ReadyOrders />} />
        {/* Rutas específicas de cocina */}
        <Route path="kitchen" element={<KitchenDashboard />} />
        <Route path="history" element={<KitchenHistory />} />
        {/* Rutas específicas de cajero */}
        <Route path="closing" element={<CashierClosing />} />
        {/* Rutas específicas de cliente */}
        <Route path="reservations" element={<ClientReservation />} />
        {/* Rutas específicas de admin */}
        <Route path="users" element={<AdminUsers />} />
        <Route path="menu" element={<AdminMenu />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="inventory" element={<AdminInventory />} />
        {/* Rutas genéricas para demostración */}
        <Route path="*" element={<PlaceholderPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
