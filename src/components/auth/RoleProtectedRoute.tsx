import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import type { UserRole } from '@/types';
import { Spinner } from '@components/ui/Spinner';

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RoleProtectedRoute({
  allowedRoles,
  redirectTo,
}: RoleProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <Spinner label="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const fallback =
      redirectTo ?? (user.role === 'admin' ? '/owner' : '/');
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
