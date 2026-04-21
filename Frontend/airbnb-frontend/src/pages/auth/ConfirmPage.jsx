import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { confirmAccount } from '../../api/authService';

export default function ConfirmPage() {
  // useParams lee el :token de la URL /confirm/xxxxxxxx
  const { token } = useParams();
  const [message, setMessage] = useState('Confirmando tu cuenta...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Se ejecuta automáticamente al cargar la página
    confirmAccount(token)
      .then(res => setMessage(res.data.message))
      .catch(err => {
        setIsError(true);
        setMessage(err.response?.data?.error || 'El enlace es inválido o ya expiró.');
      });
  }, [token]);

  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <div className={`p-6 rounded-xl ${isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
        <p className="text-lg font-medium">{message}</p>
      </div>
      {!isError && (
        <Link to="/login" className="mt-6 inline-block bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700">
          Ir al login
        </Link>
      )}
    </div>
  );
}
