import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProperty, updateProperty, getPropertyById } from '../../api/propertyService';

export default function PropertyFormPage() {
  const { id } = useParams(); // si existe id → edición, si no → creación
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: '', description: '', location: '', pricePerNight: '', capacity: ''
  });
  const [error, setError] = useState('');

  // Si estamos editando, carga los datos actuales
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
      setError(err.response?.data?.error || 'Error al guardar la propiedad');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-6 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-semibold mb-6">{isEditing ? 'Editar propiedad' : 'Nueva propiedad'}</h1>
      {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {[
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'description', label: 'Descripción', type: 'text' },
          { name: 'location', label: 'Ubicación', type: 'text' },
          { name: 'pricePerNight', label: 'Precio por noche ($)', type: 'number' },
          { name: 'capacity', label: 'Capacidad (personas)', type: 'number' },
        ].map(field => (
          <div key={field.name}>
            <label className="text-sm font-medium text-gray-700">{field.label}</label>
            <input name={field.name} type={field.type} value={form[field.name]} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              required />
          </div>
        ))}
        <div className="flex gap-3 mt-2">
          <button type="submit" className="flex-1 bg-rose-600 text-white py-2 rounded-lg font-medium hover:bg-rose-700">
            {isEditing ? 'Guardar cambios' : 'Crear propiedad'}
          </button>
          <button type="button" onClick={() => navigate('/host/properties')}
            className="flex-1 border py-2 rounded-lg font-medium hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}