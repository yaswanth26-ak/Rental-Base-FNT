import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { RoleProtectedRoute } from '@components/auth/RoleProtectedRoute';
import { AppLayout } from '@components/layout/AppLayout';
import { useAuth } from '@context/AuthContext';
import { LoginPage } from '@pages/auth/LoginPage';
import { RegisterPage } from '@pages/auth/RegisterPage';
import { HomePage } from '@pages/customer/HomePage';
import { PropertiesPage } from '@pages/customer/PropertiesPage';
import { PropertyDetailPage } from '@pages/customer/PropertyDetailPage';
import { BookingsPage } from '@pages/customer/BookingsPage';
import { BookingDetailPage } from '@pages/customer/BookingDetailPage';
import { ProfilePage } from '@pages/customer/ProfilePage';
import { OwnerDashboardPage } from '@pages/owner/OwnerDashboardPage';
import { OwnerPropertiesPage } from '@pages/owner/OwnerPropertiesPage';
import { OwnerPropertyFormPage } from '@pages/owner/OwnerPropertyFormPage';
import { OwnerPropertyImagesPage } from '@pages/owner/OwnerPropertyImagesPage';
import { OwnerPropertyAmenitiesPage } from '@pages/owner/OwnerPropertyAmenitiesPage';
import { OwnerBookingsPage } from '@pages/owner/OwnerBookingsPage';
import { Spinner } from '@components/ui/Spinner';

function RootRedirect() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <Spinner label="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user?.role === 'admin' ? '/owner' : '/'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<RoleProtectedRoute allowedRoles={['user']} />}>
            <Route index element={<HomePage />} />
            {/* Legacy multi-property URLs redirect to the single-house home */}
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="properties/:id" element={<PropertyDetailPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="bookings/:id" element={<BookingDetailPage />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
            <Route path="owner" element={<OwnerDashboardPage />} />
            <Route path="owner/properties" element={<OwnerPropertiesPage />} />
            <Route
              path="owner/properties/new"
              element={<OwnerPropertyFormPage />}
            />
            <Route
              path="owner/properties/:id/edit"
              element={<OwnerPropertyFormPage />}
            />
            <Route
              path="owner/properties/:id/images"
              element={<OwnerPropertyImagesPage />}
            />
            <Route
              path="owner/properties/:id/amenities"
              element={<OwnerPropertyAmenitiesPage />}
            />
            <Route path="owner/bookings" element={<OwnerBookingsPage />} />
          </Route>

          <Route
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'user']} />
            }
          >
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
