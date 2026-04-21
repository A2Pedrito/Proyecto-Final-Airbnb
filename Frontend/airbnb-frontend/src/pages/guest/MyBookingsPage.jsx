import { useState, useEffect } from 'react';
import { cancelBooking } from '../../api/bookingService';
import api from '../../api/axiosConfig';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        // Usamos la instancia 'api' para beneficiarnos del interceptor que añade el Token
        const response = await api.get('/bookings/my');
        setBookings(response.data);
      } catch (err) {
        console.error('Error al obtener mis reservas:', err);
      }
    };
    
    fetchMyBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    try {
      await cancelBooking(id);
      const updated = bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b);
      setBookings(updated);
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo cancelar la reserva.');
    }
  };

  const statusColor = {
    'Confirmed': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
    'Completed': 'bg-gray-100 text-gray-700',
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Mis Reservas</h1>
      {bookings.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No tienes reservas aún. Ve a Buscar para hacer una.</p>
      )}
      <div className="grid gap-4">
        {bookings.map(b => (
          <div key={b.id} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">Propiedad ID: <span className="font-mono text-xs text-gray-500">{b.propertyId}</span></p>
                <p className="text-sm text-gray-600 mt-1">
                  Entrada: {b.checkIn} · Salida: {b.checkOut}
                </p>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor[b.status] || 'bg-gray-100'}`}>
                {b.status}
              </span>
            </div>
            {b.status === 'Confirmed' && (
              <button onClick={() => handleCancel(b.id)}
                className="mt-3 text-sm border border-red-300 text-red-600 px-3 py-1 rounded-lg hover:bg-red-50">
                Cancelar reserva
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}