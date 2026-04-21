import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register, resendConfirmation } from '../../api/authService';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 1 });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  // 'idle' | 'registered' — controla qué panel mostramos
  const [step, setStep] = useState('idle');

  const handleChange = (e) => {
    const value = e.target.name === 'role' ? parseInt(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });

    // Limpiamos el error visual del campo si el usuario empieza a escribir
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validar campos vacíos
    const errors = {};
    if (!form.name.trim()) errors.name = true;
    if (!form.email.trim()) errors.email = true;
    if (!form.password) errors.password = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor, completa todos los campos marcados en rojo.');
      return;
    }

    // 2. Validar reglas de negocio (ej. longitud de la contraseña)
    if (form.password.length < 6) {
      setFieldErrors({ password: true });
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await register(form);
      setStep('registered'); // muestra el panel de confirmación
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse. Intenta de nuevo.');
    }
  };

  const handleResend = async () => {
    try {
      await resendConfirmation(form.email);
      alert('Nuevo enlace enviado. Revisa tu bandeja en Mailpit (http://localhost:8025).');
    } catch {
      alert('No se pudo reenviar. Intenta de nuevo.');
    }
  };

  // ── Panel post-registro ──────────────────────────────────────────────
  if (step === 'registered') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisa tu correo</h2>
            <p className="text-gray-600 text-sm mb-2">
              Enviamos un enlace de confirmación a:
            </p>
            <p className="font-semibold text-gray-900 mb-6">{form.email}</p>

            {/* Instrucción para Mailpit */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-left mb-6">
              <p className="text-sm font-semibold text-rose-700 mb-1">¿Dónde está el correo?</p>
              <p className="text-sm text-rose-600">
                Abre{' '}
                <a
                  href="http://localhost:8025"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline"
                >
                  http://localhost:8025
                </a>{' '}
                (panel de Mailpit) y haz clic en el correo recibido.
              </p>
            </div>

            <button
              onClick={handleResend}
              className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition mb-3"
            >
              Reenviar enlace de confirmación
            </button>

            <Link
              to="/login"
              className="block w-full bg-rose-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-700 transition"
            >
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulario de registro ───────────────────────────────────────────
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <span className="text-4xl">🏠</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Crea tu cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Es gratis y toma menos de un minuto</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {error && (
            <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Nombre */}
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">
                Nombre completo
              </p>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tu nombre de viajero"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
                  fieldErrors.name ? 'border-red-500 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-rose-400 focus:border-transparent'
                }`}
              />
            </div>

            {/* Correo */}
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
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
                  fieldErrors.email ? 'border-red-500 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-rose-400 focus:border-transparent'
                }`}
              />
            </div>

            {/* Contraseña */}
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">
                Contraseña
              </p>
              <label className="text-sm text-gray-600 mb-1 block">
                Mínimo 6 caracteres
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
                  fieldErrors.password ? 'border-red-500 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-rose-400 focus:border-transparent'
                }`}
              />
            </div>

            {/* Tipo de cuenta */}
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">
                Tipo de cuenta
              </p>
              <label className="text-sm text-gray-600 mb-1 block">
                Elige cómo quieres usar la plataforma
              </label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <label className={`flex flex-col items-center gap-1 p-3 border-2 rounded-xl cursor-pointer transition text-center text-sm
                  ${form.role === 1 ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="role"
                    value={1}
                    checked={form.role === 1}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-2xl">🧳</span>
                  <span className="font-semibold text-gray-800">Guest</span>
                  <span className="text-xs text-gray-500">Quiero reservar</span>
                </label>
                <label className={`flex flex-col items-center gap-1 p-3 border-2 rounded-xl cursor-pointer transition text-center text-sm
                  ${form.role === 0 ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="role"
                    value={0}
                    checked={form.role === 0}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-2xl">🏡</span>
                  <span className="font-semibold text-gray-800">Host</span>
                  <span className="text-xs text-gray-500">Quiero publicar</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 text-white py-2.5 rounded-xl font-semibold hover:bg-rose-700 active:scale-95 transition mt-1"
            >
              Crear cuenta
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-rose-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}