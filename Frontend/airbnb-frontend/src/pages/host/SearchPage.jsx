import { useState } from 'react';
import { getProperties } from '../../api/propertyService';
import { createBooking } from '../../api/bookingService';

export default function SearchPage() {
  const [filters, setFilters] = useState({ location: '', checkIn: '', checkOut: '', capacity: '', maxPrice: '' });
  const [properties, setProperties] = useState([]);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage('');
    // Construye el objeto de filtros eliminando los vacíos
    const params = {};
    if (filters.location)  params.location  = filters.location;
    if (filters.checkIn)   params.checkIn   = filters.checkIn;
    if (filters.checkOut)  params.checkOut  = filters.checkOut;
    if (filters.capacity)  params.capacity  = parseInt(filters.capacity);
    if (filters.maxPrice)  params.maxPrice  = parseFloat(filters.maxPrice);

    const res = await getProperties(params);
    setProperties(res.data);
    setSearched(true);
  };

  const handleBook = async (propertyId) => {
    if (!filters.checkIn || !filters.checkOut) {
      setMessage('Selecciona fechas de entrada y salida antes de reservar.');
      return;
    }
    try {
      const response = await createBooking({ propertyId, checkIn: filters.checkIn, checkOut: filters.checkOut });
      
      // Guardamos la reserva localmente en localStorage
      const newBooking = {
        id: response?.data?.id || crypto.randomUUID(), // Usa el ID del backend si lo devuelve, si no, genera uno temporal
        propertyId,
        checkIn: filters.checkIn,
        checkOut: filters.checkOut,
        status: 'Confirmed'
      };
      const existingBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
      existingBookings.push(newBooking);
      localStorage.setItem('myBookings', JSON.stringify(existingBookings));

      setMessage('¡Reserva creada exitosamente!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'No se pudo crear la reserva.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Buscar propiedades</h1>

      <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl shadow-sm border mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <input name="location" placeholder="Ubicación" value={filters.location} onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        <input name="checkIn" type="date" value={filters.checkIn} onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        <input name="checkOut" type="date" value={filters.checkOut} onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        <input name="capacity" type="number" placeholder="Huéspedes" value={filters.capacity} onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        <input name="maxPrice" type="number" placeholder="Precio máximo" value={filters.maxPrice} onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        <button type="submit" className="bg-rose-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-rose-700 col-span-2 md:col-span-1">
          Buscar
        </button>
      </form>

      {message && <p className="mb-4 text-sm bg-blue-50 text-blue-700 p-3 rounded-lg">{message}</p>}

      {searched && properties.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No hay propiedades disponibles con esos filtros.</p>
      )}

      <div className="grid gap-4">
        {properties.map(p => (
          <div key={p.id} className="bg-white border rounded-xl p-4 flex justify-between items-start shadow-sm">
            <div>
              <h2 className="font-semibold text-lg">{p.title}</h2>
              <p className="text-gray-500 text-sm mt-1">{p.location}</p>
              <p className="text-gray-700 text-sm mt-1">{p.description}</p>
              <p className="text-rose-600 font-medium mt-2">${p.pricePerNight}/noche · {p.capacity} huéspedes</p>
            </div>
            <button onClick={() => handleBook(p.id)}
              className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-rose-700 mt-1 whitespace-nowrap">
              Reservar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}