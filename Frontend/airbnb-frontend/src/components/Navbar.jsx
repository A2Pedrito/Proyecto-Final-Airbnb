import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Constantes para los estilos de los enlaces para no repetir código y facilitar el mantenimiento
  const navLinkStyle = "px-4 py-2 rounded-full hover:bg-white/40 transition-colors duration-200 font-medium";
  const primaryLinkStyle = "bg-white text-rose-600 px-4 py-2 rounded-full font-bold hover:bg-rose-100 transition-colors duration-200 shadow-sm";

  return (
    <nav className="bg-rose-600 text-white px-6 py-3 flex justify-between items-center shadow">
      <Link to="/" className="font-bold text-lg tracking-tight px-2 py-1 rounded-full hover:bg-white/10 transition-colors">
        🏠 Airbnb Clone
      </Link>

      <div className="flex gap-2 items-center text-sm">
        {/* Sin sesión */}
        {!user && (
          <>
            <Link to="/login" className={navLinkStyle}>Iniciar sesión</Link>
            <Link to="/register" className={primaryLinkStyle}>
              Registrarse
            </Link>
          </>
        )}

        {/* Solo Host */}
        {user?.role === 'Host' && (
          <Link to="/host/properties" className={navLinkStyle}>Mis Propiedades</Link>
        )}

        {/* Solo Guest */}
        {user?.role === 'Guest' && (
          <>
            <Link to="/guest/search" className={navLinkStyle}>Buscar</Link>
            <Link to="/guest/bookings" className={navLinkStyle}>Mis Reservas</Link>
          </>
        )}

        {/* Ambos roles */}
        {user && (
          <>
            <Link to="/notifications" className={navLinkStyle}>🔔 Notificaciones</Link>
            <span className="text-rose-200 px-4 py-2">Hola, {user.name}</span>
            <button 
              onClick={handleLogout} 
              className={`${primaryLinkStyle} ml-2`}
            >
              Salir
            </button>
          </>
        )}
      </div>
    </nav>
  );
}