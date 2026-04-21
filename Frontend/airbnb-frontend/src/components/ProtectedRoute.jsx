import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// allowedRoles es opcional. Ejemplos de uso:
// <ProtectedRoute>                          → solo verifica que haya sesión
// <ProtectedRoute allowedRoles={['Host']}>  → solo deja pasar a Hosts
// <ProtectedRoute allowedRoles={['Guest']}> → solo deja pasar a Guests
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // Sin sesión → al login
  if (!user) return <Navigate to="/login" replace />;

  // Con sesión pero rol incorrecto → acceso denegado
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}