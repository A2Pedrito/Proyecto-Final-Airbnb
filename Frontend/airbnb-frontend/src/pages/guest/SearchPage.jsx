import { useState } from 'react';
import { getProperties } from '../../api/propertyService';
import { createBooking } from '../../api/bookingService';

export default function SearchPage() {
  const [filters, setFilters] = useState({
    location: '', checkIn: '', checkOut: '', capacity: '', maxPrice: ''
  });
  const [properties, setProperties] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [bookingModal, setBookingModal] = useState({ isOpen: false, property: null, checkIn: '', checkOut: '' });

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    const params = {};
    if (filters.location)  params.location  = filters.location;
    if (filters.checkIn)   params.checkIn   = filters.checkIn;
    if (filters.checkOut)  params.checkOut  = filters.checkOut;
    if (filters.capacity)  params.capacity  = parseInt(filters.capacity);
    if (filters.maxPrice)  params.maxPrice  = parseFloat(filters.maxPrice);

    try {
      const res = await getProperties(params);
      setProperties(res.data);
      setSearched(true);
    } catch {
      setMessage({ text: 'Error al buscar propiedades.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (property) => {
    setBookingModal({
      isOpen: true,
      property,
      checkIn: filters.checkIn || '',
      checkOut: filters.checkOut || ''
    });
  };

  const handleConfirmBooking = async () => {
    if (!bookingModal.checkIn || !bookingModal.checkOut) {
      setMessage({ text: 'Selecciona fechas de entrada y salida antes de reservar.', type: 'warn' });
      return;
    }
    setLoading(true);
    try {
      const response = await createBooking({
        propertyId: bookingModal.property.id,
        checkIn: bookingModal.checkIn,
        checkOut: bookingModal.checkOut,
      });
      const newBooking = {
        id: response?.data?.id || crypto.randomUUID(),
        propertyId: bookingModal.property.id,
        checkIn: bookingModal.checkIn,
        checkOut: bookingModal.checkOut,
        status: 'Confirmed',
      };
      const existing = JSON.parse(localStorage.getItem('myBookings') || '[]');
      existing.push(newBooking);
      localStorage.setItem('myBookings', JSON.stringify(existing));
      setMessage({ text: '¡Reserva creada exitosamente! Puedes verla en "Mis Reservas".', type: 'success' });
      setBookingModal({ isOpen: false, property: null, checkIn: '', checkOut: '' });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'No se pudo crear la reserva.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const msgStyle = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error:   'bg-red-50 border-red-200 text-red-700',
    warn:    'bg-amber-50 border-amber-200 text-amber-700',
  };

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Explorar</p>
        <h1 className="text-3xl font-bold text-gray-900">Buscar propiedades</h1>
        <p className="text-gray-500 text-sm mt-1">Filtra por ubicación, fechas, huéspedes o precio</p>
      </div>

      {/* Formulario de filtros */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">Ubicación</p>
            <label className="text-xs text-gray-500 mb-1 block">Ciudad o zona donde quieres alojarte</label>
            <input
              name="location"
              placeholder="Ej: Punta Cana, Santo Domingo..."
              value={filters.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">Fecha de entrada</p>
            <label className="text-xs text-gray-500 mb-1 block">Día en que llegas a la propiedad</label>
            <input
              name="checkIn"
              type="date"
              value={filters.checkIn}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">Fecha de salida</p>
            <label className="text-xs text-gray-500 mb-1 block">Día en que dejas la propiedad</label>
            <input
              name="checkOut"
              type="date"
              value={filters.checkOut}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">Huéspedes</p>
            <label className="text-xs text-gray-500 mb-1 block">Número mínimo de personas que puede alojar</label>
            <input
              name="capacity"
              type="number"
              min="1"
              placeholder="Ej: 2"
              value={filters.capacity}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">Precio máximo</p>
            <label className="text-xs text-gray-500 mb-1 block">Presupuesto máximo por noche en dólares</label>
            <input
              name="maxPrice"
              type="number"
              min="1"
              placeholder="Ej: 200"
              value={filters.maxPrice}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-rose-700 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? 'Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        </div>
      </form>

      {/* Mensaje de feedback */}
      {message.text && (
        <div className={`mb-5 flex items-start gap-2 border rounded-xl p-3 text-sm ${msgStyle[message.type]}`}>
          <span>{message.type === 'success' ? '✅' : message.type === 'error' ? '⚠️' : '💡'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {/* Sin resultados */}
      {searched && properties.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-600 font-medium">No hay propiedades disponibles</p>
          <p className="text-gray-400 text-sm mt-1">Prueba con otros filtros o fechas diferentes</p>
        </div>
      )}

      {/* Lista de propiedades */}
      {properties.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {properties.length} propiedad{properties.length !== 1 ? 'es' : ''} encontrada{properties.length !== 1 ? 's' : ''}
          </p>
          <div className="grid gap-4">
            {properties.map(p => (
              <div
                key={p.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 flex justify-between items-start shadow-sm hover:shadow-md transition"
              >
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🏠</span>
                    <h2 className="font-semibold text-gray-900 text-lg">{p.title}</h2>
                  </div>
                  <p className="text-gray-500 text-sm">📍 {p.location}</p>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">{p.description}</p>
                  <div className="flex gap-4 mt-3">
                    <span className="text-rose-600 font-semibold text-sm">${p.pricePerNight}/noche</span>
                    <span className="text-gray-400 text-sm">👥 Hasta {p.capacity} huéspedes</span>
                  </div>
                </div>
                <button
                  onClick={() => handleBookClick(p)}
                  className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-700 active:scale-95 transition whitespace-nowrap"
                >
                  Reservar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Reservar {bookingModal.property.title}</h2>
            <p className="text-sm text-gray-500 mb-4">Elige tus fechas de estadía para continuar.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-1">Entrada</label>
                <input
                  type="date"
                  value={bookingModal.checkIn}
                  onChange={(e) => setBookingModal({ ...bookingModal, checkIn: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-1">Salida</label>
                <input
                  type="date"
                  value={bookingModal.checkOut}
                  onChange={(e) => setBookingModal({ ...bookingModal, checkOut: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBookingModal({ isOpen: false, property: null, checkIn: '', checkOut: '' })}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl font-semibold hover:bg-rose-700 active:scale-95 transition disabled:opacity-50"
              >
                {loading ? 'Confirmando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}