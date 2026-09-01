import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminProducts from '../components/admin/AdminProducts';
import AdminOrders from '../components/admin/AdminOrders';
import AdminBlogs from '../components/admin/AdminBlogs';
import AdminCoupons from '../components/admin/AdminCoupons';
import Navigation from '../components/Navigation';
import { useProfile } from '../hooks/useProfile';

const AdminPanel = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
  const { profile, isLoading: loading, error } = useProfile();
  const isAdmin = profile?.is_staff || profile?.is_superuser || false;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (error && error.message.includes('401')) {
      navigate('/login');
    }
  }, [error, navigate]);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-xl font-medium text-gray-500">Checking authorization...</div>
        </div>
      </>
    );
  }

  if (isAdmin === false) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8 text-center max-w-md">
            You do not have permission to view this page. This area is restricted to administrators and staff members only.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Return to Homepage
          </button>
        </div>
      </>
    );
  }

  const renderTab = () => {
    switch (currentTab) {
      case 'dashboard': return <AdminDashboard token={token} />;
      case 'users': return <AdminUsers token={token} />;
      case 'products': return <AdminProducts token={token} />;
      case 'orders': return <AdminOrders token={token} />;
      case 'blogs': return <AdminBlogs token={token} />;
      case 'coupons': return <AdminCoupons token={token} />;
      default: return <AdminDashboard token={token} />;
    }
  };

  // We don't render <Navigation /> here because the AdminLayout has its own sidebar navigation
  return (
    <AdminLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderTab()}
    </AdminLayout>
  );
};

export default AdminPanel;
