import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/authService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 1 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const value = e.target.name === 'role' ? parseInt(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      setSuccess('Cuenta creada. Revisa la consola del servidor para obtener tu token de confirmación.');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-semibold mb-6">Crear cuenta</h1>
      {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded">{error}</p>}
      {success && <p className="text-green-700 text-sm mb-4 bg-green-50 p-3 rounded">{success}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Nombre</label>
          <input name="name" value={form.name} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Correo</label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Contraseña</label>
          <input name="password" type="password" value={form.password} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Tipo de cuenta</label>
          <select name="role" value={form.role} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
            <option value={1}>Guest — quiero reservar alojamientos</option>
            <option value={0}>Host — quiero publicar propiedades</option>
          </select>
        </div>
        <button type="submit"
          className="bg-rose-600 text-white py-2 rounded-lg font-medium hover:bg-rose-700">
          Crear cuenta
        </button>
      </form>
      <p className="text-sm text-center mt-4 text-gray-600">
        ¿Ya tienes cuenta? <Link to="/login" className="text-rose-600 hover:underline">Inicia sesión</Link>
      </p>
    </div>
  );
}