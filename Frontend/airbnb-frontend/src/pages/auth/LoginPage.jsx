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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data);  // guarda token, role y name en el contexto
      // Redirige según el rol
      if (res.data.role === 'Host') navigate('/host/properties');
      else navigate('/guest/search');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-semibold mb-6">Iniciar sesión</h1>
      {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Correo</label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Contraseña</label>
          <input name="password" type="password" value={form.password} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            required />
        </div>
        <button type="submit" disabled={loading}
          className="bg-rose-600 text-white py-2 rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50">
          {loading ? 'Entrando...' : 'Iniciar sesión'}
        </button>
      </form>
      <p className="text-sm text-center mt-4 text-gray-600">
        ¿No tienes cuenta? <Link to="/register" className="text-rose-600 hover:underline">Regístrate</Link>
      </p>
    </div>
  );
}