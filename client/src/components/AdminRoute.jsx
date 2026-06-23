import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  return ['admin', 'super_admin'].includes(user?.role) ? children : <Navigate to="/app" replace />;
}
