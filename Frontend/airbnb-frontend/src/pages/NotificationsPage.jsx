import { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '../api/notificationService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const load = async () => {
    const res = await getNotifications(onlyUnread);
    setNotifications(res.data);
  };

  useEffect(() => { load(); }, [onlyUnread]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      // Actualiza la lista localmente sin recargar
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      alert('No se pudo marcar como leída.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Notificaciones</h1>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={onlyUnread} onChange={e => setOnlyUnread(e.target.checked)} />
          Solo no leídas
        </label>
      </div>

      {notifications.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No hay notificaciones.</p>
      )}

      <div className="flex flex-col gap-3">
        {notifications.map(n => (
          <div key={n.id}
            className={`p-4 rounded-xl border flex justify-between items-start ${n.isRead ? 'bg-white' : 'bg-rose-50 border-rose-200'}`}>
            <div>
              <p className="text-sm text-gray-800">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            {!n.isRead && (
              <button onClick={() => handleMarkRead(n.id)}
                className="text-xs text-rose-600 hover:underline whitespace-nowrap ml-4">
                Marcar leída
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}