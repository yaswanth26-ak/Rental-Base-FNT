import { Navigate } from 'react-router-dom';

/** Legacy multi-property routes redirect to the single-house home. */
export function PropertiesPage() {
  return <Navigate to="/" replace />;
}
