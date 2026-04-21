import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProperties, blockDates, unblockDates } from '../../api/propertyService';

export default function MyPropertiesPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Modal for blocking dates
  const [blockModal, setBlockModal] = useState({ isOpen: false, property: null, date: '', isBlocking: true });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await getProperties();
      
      // Get the host ID from the token to filter properties
      const token = localStorage.getItem('token');
      let hostId = null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          hostId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub || payload.nameid;
        } catch (e) {
          console.error("Error parsing token", e);
        }
      }

      // If we found a hostId, filter. Otherwise show all (fallback for development)
      const hostProperties = hostId 
        ? res.data.filter(p => p.hostId === hostId)
        : res.data;
        
      setProperties(hostProperties);
    } catch (err) {
      setMessage({ text: 'Error al cargar propiedades.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBlockModal = (property, isBlocking) => {
    setBlockModal({ isOpen: true, property, date: '', isBlocking });
  };

  const handleConfirmBlockAction = async () => {
    if (!blockModal.date) {
      setMessage({ text: 'Selecciona una fecha.', type: 'warn' });
      return;
    }
    
    try {
      const datesToProcess = [blockModal.date];
      if (blockModal.isBlocking) {
        await blockDates(blockModal.property.id, datesToProcess);
        setMessage({ text: 'Fecha bloqueada exitosamente.', type: 'success' });
      } else {
        await unblockDates(blockModal.property.id, datesToProcess);
        setMessage({ text: 'Fecha desbloqueada exitosamente.', type: 'success' });
      }
      setBlockModal({ isOpen: false, property: null, date: '', isBlocking: true });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'No se pudo completar la acción.', type: 'error' });
    }
  };

  const msgStyle = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error:   'bg-red-50 border-red-200 text-red-700',
    warn:    'bg-amber-50 border-amber-200 text-amber-700',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Panel del host</p>
          <h1 className="text-3xl font-bold text-gray-900">Mis Propiedades</h1>
        </div>
        <Link 
          to="/host/properties/new" 
          className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-rose-700 transition"
        >
          + Nueva Propiedad
        </Link>
      </div>

      {message.text && (
        <div className={`mb-5 flex items-start gap-2 border rounded-xl p-3 text-sm ${msgStyle[message.type]}`}>
          <span>{message.type === 'success' ? '✅' : message.type === 'error' ? '⚠️' : '💡'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando propiedades...</p>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🏠</p>
          <p className="text-gray-600 font-medium">No tienes propiedades registradas</p>
          <Link to="/host/properties/new" className="text-rose-600 text-sm mt-1 hover:underline">
            Crea tu primer alojamiento aquí
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {properties.map(p => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-md transition">
              <div className="flex-1 mb-4 md:mb-0">
                <h2 className="font-semibold text-gray-900 text-lg">{p.title}</h2>
                <p className="text-gray-500 text-sm">📍 {p.location}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-rose-600 font-semibold text-sm">${p.pricePerNight}/noche</span>
                  <span className="text-gray-400 text-sm">👥 Hasta {p.capacity} huéspedes</span>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Link
                  to={`/host/properties/${p.id}/edit`}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleOpenBlockModal(p, true)}
                  className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-200 transition"
                >
                  Bloquear Fecha
                </button>
                <button
                  onClick={() => handleOpenBlockModal(p, false)}
                  className="border border-amber-200 text-amber-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-50 transition"
                >
                  Desbloquear
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Block/Unblock Dates Modal */}
      {blockModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {blockModal.isBlocking ? 'Bloquear Fecha' : 'Desbloquear Fecha'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Selecciona la fecha que deseas {blockModal.isBlocking ? 'bloquear' : 'desbloquear'} para <strong>{blockModal.property.title}</strong>.
            </p>
            
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-1">Fecha</label>
              <input
                type="date"
                value={blockModal.date}
                onChange={(e) => setBlockModal({ ...blockModal, date: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBlockModal({ isOpen: false, property: null, date: '', isBlocking: true })}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBlockAction}
                className={`flex-1 text-white py-2.5 rounded-xl font-semibold active:scale-95 transition ${
                  blockModal.isBlocking ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}