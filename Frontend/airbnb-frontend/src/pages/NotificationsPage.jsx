import { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '../api/notificationService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getNotifications(onlyUnread);
      setNotifications(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [onlyUnread]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      alert('No se pudo marcar como leída.');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Centro de mensajes</p>
          <h1 className="text-3xl font-bold text-gray-900">
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-2 text-sm bg-rose-600 text-white px-2 py-0.5 rounded-full font-semibold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Eventos y actualizaciones de tus reservas</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none mt-2">
          <div className={`w-9 h-5 rounded-full transition-colors relative ${onlyUnread ? 'bg-rose-500' : 'bg-gray-300'}`}
            onClick={() => setOnlyUnread(!onlyUnread)}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${onlyUnread ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          Solo no leídas
        </label>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2 animate-pulse">⏳</p>
          <p>Cargando notificaciones...</p>
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-600 font-medium">
            {onlyUnread ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones aún'}
          </p>
          <p className="text-gray-400 text-sm mt-1">Aquí aparecerán los eventos importantes de tus reservas</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl border flex justify-between items-start gap-4 transition
              ${n.isRead ? 'bg-white border-gray-100' : 'bg-rose-50 border-rose-200'}`}
          >
            <div className="flex gap-3 items-start flex-1">
              <span className={`text-xl mt-0.5 ${n.isRead ? 'opacity-40' : ''}`}>
                {n.isRead ? '📭' : '📬'}
              </span>
              <div>
                <p className="text-sm text-gray-800 leading-relaxed">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString('es-DO', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            {!n.isRead && (
              <button
                onClick={() => handleMarkRead(n.id)}
                className="text-xs text-rose-600 font-medium hover:underline whitespace-nowrap shrink-0 mt-1"
              >
                Marcar leída
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}