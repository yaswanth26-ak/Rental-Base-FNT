import { Navigate } from 'react-router-dom';

/** Legacy property detail route — customers land on Home for the fixed house. */
export function PropertyDetailPage() {
  return <Navigate to="/" replace />;
}
