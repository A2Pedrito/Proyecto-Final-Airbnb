import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResendBtn, setShowResendBtn] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  const { login } = useAuth(); // Asumiendo que usas tu AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowResendBtn(false);
    setResendMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al iniciar sesión');
        
        // Si el backend nos dice que la cuenta no está confirmada, mostramos el botón
        // Asegúrate de que el texto coincida con la excepción de tu LoginUserUseCase
        if (data.message && data.message.toLowerCase().includes('no está confirmado')) {
          setShowResendBtn(true);
        }
        return;
      }

      // Login exitoso
      // Asumimos que tu contexto Auth guarda el token y el usuario
      login(data.token, data); 
      navigate('/'); // Redirigir al inicio
      
    } catch (err) {
      setError('Error de conexión con el servidor.');
    }
  };

  const handleResendConfirmation = async () => {
    setResendMessage('Enviando...');
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }) // Enviamos el email actual del formulario
      });
      
      const data = await response.json();
      setResendMessage(data.message || 'Si el correo existe, se enviará un nuevo enlace.');
    } catch (err) {
      setResendMessage('Error al intentar reenviar el correo.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Iniciar Sesión</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="email" placeholder="Correo electrónico" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '8px' }}
        />
        <input 
          type="password" placeholder="Contraseña" required
          value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '8px' }}
        />
        
        <button type="submit" style={{ padding: '10px', background: '#e11d48', color: 'white', border: 'none', cursor: 'pointer' }}>
          Entrar
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      
      {showResendBtn && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '5px' }}>
          <p style={{ fontSize: '0.9rem' }}>¿Tu enlace expiró o no lo recibiste?</p>
          <button onClick={handleResendConfirmation}>Reenviar enlace de confirmación</button>
          {resendMessage && <p style={{ fontSize: '0.8rem', color: 'green', marginTop: '0.5rem' }}>{resendMessage}</p>}
        </div>
      )}
    </div>
  );
}
