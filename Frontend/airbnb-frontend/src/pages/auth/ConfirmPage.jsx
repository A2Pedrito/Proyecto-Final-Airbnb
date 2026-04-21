import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { confirmAccount } from '../../api/authService';

export default function ConfirmPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    confirmAccount(token)
      .then(res => {
        setMessage(res.data.message);
        setStatus('success');
      })
      .catch(err => {
        setMessage(err.response?.data?.error || 'El enlace es inválido o ya expiró.');
        setStatus('error');
      });
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm text-center">

        {status === 'loading' && (
          <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
            <div className="text-5xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-600 font-medium">Verificando tu cuenta...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Listo!</h2>
            <p className="text-gray-600 text-sm mb-8">{message}</p>
            <Link
              to="/login"
              className="inline-block w-full bg-rose-600 text-white py-2.5 rounded-xl font-semibold hover:bg-rose-700 transition"
            >
              Ir al inicio de sesión
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enlace inválido</h2>
            <p className="text-gray-600 text-sm mb-8">{message}</p>
            <Link
              to="/register"
              className="inline-block w-full bg-rose-600 text-white py-2.5 rounded-xl font-semibold hover:bg-rose-700 transition"
            >
              Volver al registro
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}