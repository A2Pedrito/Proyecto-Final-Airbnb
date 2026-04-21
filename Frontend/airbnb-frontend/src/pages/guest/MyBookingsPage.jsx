import { useState, useEffect } from 'react';
import { cancelBooking } from '../../api/bookingService';
import api from '../../api/axiosConfig';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/bookings/my')
      .then(res => setBookings(res.data))
      .catch(() => setError('No se pudieron cargar tus reservas.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    try {
      await cancelBooking(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo cancelar la reserva.');
    }
  };

  const statusConfig = {
    Confirmed: { label: 'Confirmada', style: 'bg-green-100 text-green-700', icon: '✅' },
    Cancelled: { label: 'Cancelada',  style: 'bg-red-100 text-red-700',    icon: '❌' },
    Completed: { label: 'Completada', style: 'bg-gray-100 text-gray-600',  icon: '🏁' },
  };

  if (loading) return (
    <div className="text-center py-20 text-gray-500">
      <p className="text-3xl mb-2 animate-pulse">⏳</p>
      <p>Cargando reservas...</p>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Mi cuenta</p>
        <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
        <p className="text-gray-500 text-sm mt-1">Historial de todas tus reservas</p>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {bookings.length === 0 && !error && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🧳</p>
          <p className="text-gray-600 font-medium">No tienes reservas aún</p>
          <p className="text-gray-400 text-sm mt-1">Ve a buscar propiedades y haz tu primera reserva</p>
        </div>
      )}

      <div className="grid gap-4">
        {bookings.map(b => {
          const sc = statusConfig[b.status] || { label: b.status, style: 'bg-gray-100 text-gray-600', icon: '📋' };
          return (
            <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Propiedad</p>
                  <p className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">
                    {b.propertyId}
                  </p>
                  <div className="flex gap-6 mt-3">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Entrada</p>
                      <p className="font-semibold text-gray-800 text-sm">{b.checkIn}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Salida</p>
                      <p className="font-semibold text-gray-800 text-sm">{b.checkOut}</p>
                    </div>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${sc.style}`}>
                  {sc.icon} {sc.label}
                </span>
              </div>
              {b.status === 'Confirmed' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="text-sm border border-red-300 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-50 transition"
                  >
                    Cancelar reserva
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}