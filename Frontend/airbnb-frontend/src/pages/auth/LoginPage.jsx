import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/authService';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data);
      if (res.data.role === 'Host') navigate('/host/properties');
      else navigate('/guest/search');
    } catch (err) {
      setError(err.response?.data?.error || 'Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <span className="text-4xl">🏠</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Bienvenido de nuevo</h1>
          <p className="text-gray-500 text-sm mt-1">Tu próxima aventura te espera.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {error && (
            <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Campo correo */}
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">
                Correo electrónico
              </p>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                required
              />
            </div>

            {/* Campo contraseña */}
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">
                Contraseña
              </p>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 text-white py-2.5 rounded-xl font-semibold hover:bg-rose-700 active:scale-95 transition disabled:opacity-50 mt-1"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-rose-600 font-medium hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}