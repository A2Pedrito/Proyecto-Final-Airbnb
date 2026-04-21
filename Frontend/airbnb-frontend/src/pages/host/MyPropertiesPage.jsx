import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProperty, updateProperty, getPropertyById } from '../../api/propertyService';

const fields = [
  {
    name: 'title',
    label: 'Título de la propiedad',
    subtitle: 'El nombre que verán los huéspedes al buscar',
    placeholder: 'Ej: Casa moderna en el centro con vista al mar',
    type: 'text',
  },
  {
    name: 'description',
    label: 'Descripción',
    subtitle: 'Describe qué hace especial a tu propiedad',
    placeholder: 'Ej: Espaciosa casa de 2 habitaciones con piscina, a 5 minutos de la playa...',
    type: 'text',
  },
  {
    name: 'location',
    label: 'Ubicación',
    subtitle: 'Ciudad o zona donde se encuentra la propiedad (no se puede editar después)',
    placeholder: 'Ej: Punta Cana, La Altagracia',
    type: 'text',
  },
  {
    name: 'pricePerNight',
    label: 'Precio por noche',
    subtitle: 'Tarifa en dólares que pagarán los huéspedes por cada noche',
    placeholder: 'Ej: 120',
    type: 'number',
  },
  {
    name: 'capacity',
    label: 'Capacidad máxima',
    subtitle: 'Número máximo de personas que puede alojar la propiedad',
    placeholder: 'Ej: 4',
    type: 'number',
  },
];

export default function PropertyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: '', description: '', location: '', pricePerNight: '', capacity: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      getPropertyById(id).then(res => {
        const p = res.data;
        setForm({
          title: p.title,
          description: p.description,
          location: p.location,
          pricePerNight: p.pricePerNight,
          capacity: p.capacity,
        });
      });
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const data = {
      ...form,
      pricePerNight: parseFloat(form.pricePerNight),
      capacity: parseInt(form.capacity),
    };
    try {
      if (isEditing) await updateProperty(id, data);
      else await createProperty(data);
      navigate('/host/properties');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la propiedad. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Panel del host</p>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar propiedad' : 'Nueva propiedad'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isEditing
            ? 'Actualiza los datos de tu alojamiento'
            : 'Completa los datos para publicar tu alojamiento'}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {error && (
          <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {fields.map(field => {
            // La ubicación no se puede editar
            const isDisabled = isEditing && field.name === 'location';
            return (
              <div key={field.name}>
                <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">
                  {field.label}
                </p>
                <label className="text-sm text-gray-600 mb-1 block">
                  {field.subtitle}
                </label>
                <input
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  disabled={isDisabled}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition
                    ${isDisabled ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' : 'border-gray-300'}`}
                  required
                />
                {isDisabled && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ La ubicación no se puede cambiar después de crear la propiedad</p>
                )}
              </div>
            );
          })}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl font-semibold hover:bg-rose-700 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : isEditing ? '💾 Guardar cambios' : '🚀 Publicar propiedad'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/host/properties')}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}