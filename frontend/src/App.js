import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientsList from './pages/ClientsList';
import ClientForm from './pages/ClientForm';
import ClientProfile from './pages/ClientProfile';
import AdminPanel from './pages/AdminPanel';
import Contracts from './pages/Contracts';
import LegalLibrary from './pages/LegalLibrary';
import Analytics from './pages/Analytics';
import './styles/index.css';

// مكون حماية المسارات
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full spinner mx-auto mb-4"></div>
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
};

// مكون حماية صفحات الأدمن
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

// Layout مع Sidebar
const AppLayout = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <main className="flex-1 lg:mr-64 p-6 overflow-x-hidden">
      {children}
    </main>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
              fontFamily: 'Cairo, sans-serif',
              direction: 'rtl',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* صفحة تسجيل الدخول */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* الصفحات المحمية */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AppLayout><Dashboard /></AppLayout>
            </PrivateRoute>
          } />

          <Route path="/clients" element={
            <PrivateRoute>
              <AppLayout><ClientsList /></AppLayout>
            </PrivateRoute>
          } />

          <Route path="/clients/new" element={
            <PrivateRoute>
              <AppLayout><ClientForm /></AppLayout>
            </PrivateRoute>
          } />

          <Route path="/clients/:id" element={
            <PrivateRoute>
              <AppLayout><ClientProfile /></AppLayout>
            </PrivateRoute>
          } />

          <Route path="/clients/:id/edit" element={
            <PrivateRoute>
              <AppLayout><ClientForm /></AppLayout>
            </PrivateRoute>
          } />

          <Route path="/contracts" element={
            <PrivateRoute>
              <AppLayout><Contracts /></AppLayout>
            </PrivateRoute>
          } />

          <Route path="/library" element={
            <PrivateRoute>
              <AppLayout><LegalLibrary /></AppLayout>
            </PrivateRoute>
          } />

          <Route path="/analytics" element={
            <PrivateRoute>
              <AppLayout><Analytics /></AppLayout>
            </PrivateRoute>
          } />

          {/* صفحات الأدمن */}
          <Route path="/admin/lawyers" element={
            <PrivateRoute>
              <AdminRoute>
                <AppLayout><AdminPanel /></AppLayout>
              </AdminRoute>
            </PrivateRoute>
          } />

          {/* صفحة غير موجودة */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
