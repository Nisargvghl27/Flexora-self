import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminProducts from '../components/admin/AdminProducts';
import AdminBlogs from '../components/admin/AdminBlogs';
import AdminCommunity from '../components/admin/AdminCommunity';
import Navigation from '../components/Navigation';

const AdminPanel = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${baseURL}/api/profile/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.is_staff || data.is_superuser) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
          if (res.status === 401) {
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [token, navigate]);

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
      case 'blogs': return <AdminBlogs token={token} />;
      case 'community': return <AdminCommunity token={token} />;
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
