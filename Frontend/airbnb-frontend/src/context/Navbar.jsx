import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-rose-600 text-white px-6 py-3 flex justify-between items-center shadow">
      <Link to="/" className="font-bold text-lg tracking-tight">🏠 Airbnb Clone</Link>

      <div className="flex gap-5 items-center text-sm">
        {/* Sin sesión */}
        {!user && (
          <>
            <Link to="/login" className="hover:underline">Iniciar sesión</Link>
            <Link to="/register" className="bg-white text-rose-600 px-3 py-1 rounded font-medium hover:bg-rose-50">
              Registrarse
            </Link>
          </>
        )}

        {/* Solo Host */}
        {user?.role === 'Host' && (
          <Link to="/host/properties" className="hover:underline">Mis Propiedades</Link>
        )}

        {/* Solo Guest */}
        {user?.role === 'Guest' && (
          <>
            <Link to="/guest/search" className="hover:underline">Buscar</Link>
            <Link to="/guest/bookings" className="hover:underline">Mis Reservas</Link>
          </>
        )}

        {/* Ambos roles */}
        {user && (
          <>
            <Link to="/notifications" className="hover:underline">🔔 Notificaciones</Link>
            <span className="text-rose-200">Hola, {user.name}</span>
            <button onClick={handleLogout} className="bg-white text-rose-600 px-3 py-1 rounded font-medium hover:bg-rose-50">
              Salir
            </button>
          </>
        )}
      </div>
    </nav>
  );
}