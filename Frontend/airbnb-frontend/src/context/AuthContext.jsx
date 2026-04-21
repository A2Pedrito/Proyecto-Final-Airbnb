import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Al recargar la página, recupera la sesión de localStorage si existe
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    const name  = localStorage.getItem('name');
    return token ? { token, role, name } : null;
  });

  // Se llama después de un login exitoso
  // data viene del response: { token, name, email, role }
  const loginUser = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role',  data.role);   // "Host" o "Guest"
    localStorage.setItem('name',  data.name);
    setUser(data);
  };

  // Limpia todo y cierra sesión
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto fácilmente en cualquier componente
// Uso: const { user, loginUser, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);