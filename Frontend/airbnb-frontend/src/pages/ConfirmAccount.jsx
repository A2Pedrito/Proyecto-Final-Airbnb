import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ConfirmAccount() {
  const { token } = useParams(); // Extrae el token de la URL
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const hasFetched = useRef(false); // Evita doble ejecución en StrictMode

  useEffect(() => {
    const confirmToken = async () => {
      // Esta comprobación es CRUCIAL en modo de desarrollo de React (StrictMode)
      // para evitar que la petición se ejecute dos veces.
      if (hasFetched.current) {
        console.log('DEBUG: Se omite la segunda ejecución de la petición.');
        return;
      }
      hasFetched.current = true;
      console.log('DEBUG: Ejecutando la petición de confirmación por primera vez.');

      try {
        // Reemplaza con la URL real de tu API
        const response = await fetch(`http://localhost:5000/api/auth/confirm?token=${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        // Asumimos que tu backend devuelve un JSON con un campo "message"
        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          console.log('DEBUG: La cuenta se confirmó con éxito.');
          setStatus('success');
          setMessage(data.message || '¡Cuenta confirmada exitosamente!');
        } else {
          console.error('DEBUG: El backend devolvió un error.', { status: response.status, data });
          setStatus('error');
          setMessage(data.message || 'El enlace es inválido o ha expirado.');
        }
      } catch (error) {
        console.error('DEBUG: Error de red al intentar confirmar.', error);
        setStatus('error');
        setMessage('No se pudo conectar con el servidor.');
      }
    };

    if (token) {
      confirmToken();
    }
  }, [token]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: 'auto' }}>
      <h2>Confirmación de Cuenta</h2>
      
      {status === 'loading' && <p>Verificando tu enlace...</p>}
      
      {status === 'success' && (
        <div style={{ color: 'green' }}>
          <p>{message}</p>
          <Link to="/login" style={{ display: 'inline-block', marginTop: '1rem', padding: '10px 20px', background: '#e11d48', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
            Ir a Iniciar Sesión
          </Link>
        </div>
      )}
      
      {status === 'error' && (
        <div style={{ color: 'red' }}>
          <p>❌ {message}</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Si el enlace expiró, intenta iniciar sesión para solicitar uno nuevo.</p>
        </div>
      )}
    </div>
  );
}
