import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const { profile, loading } = useProfile();

  if (!user) {
    // Redirect to login, but save the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin) {
    if (loading) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }
    const isAdmin = profile?.is_staff || profile?.is_superuser || false;
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
