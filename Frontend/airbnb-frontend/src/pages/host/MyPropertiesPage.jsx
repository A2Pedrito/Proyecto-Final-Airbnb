import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProperties, deleteProperty } from '../../api/propertyService';
import { useAuth } from '../../context/AuthContext';

export default function MyPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga las propiedades al entrar a la página
  useEffect(() => {
    getProperties()
      .then(res => {
        // Filtra solo las propiedades de este host
        // Para obtener el ID del host, decodificamos el JWT
        const payload = JSON.parse(atob(user.token.split('.')[1]));
        const hostId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        const mine = res.data.filter(p => p.hostId === hostId);
        setProperties(mine);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta propiedad?')) return;
    try {
      await deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('No se pudo eliminar la propiedad.');
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Cargando...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Mis Propiedades</h1>
        <Link to="/host/properties/new"
          className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 text-sm">
          + Nueva propiedad
        </Link>
      </div>

      {properties.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No tienes propiedades aún.</p>
      )}

      <div className="grid gap-4">
        {properties.map(p => (
          <div key={p.id} className="bg-white border rounded-xl p-4 flex justify-between items-start shadow-sm">
            <div>
              <h2 className="font-semibold text-lg">{p.title}</h2>
              <p className="text-gray-500 text-sm">{p.location} · ${p.pricePerNight}/noche · {p.capacity} huéspedes</p>
            </div>
            <div className="flex gap-2 mt-1">
              <Link to={`/host/properties/${p.id}/edit`}
                className="text-sm border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50">
                Editar
              </Link>
              <button onClick={() => handleDelete(p.id)}
                className="text-sm border border-red-300 text-red-600 px-3 py-1 rounded-lg hover:bg-red-50">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}