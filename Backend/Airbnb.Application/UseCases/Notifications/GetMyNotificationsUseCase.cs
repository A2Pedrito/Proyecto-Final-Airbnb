using Airbnb.Application.DTOs.Notification;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Notifications
{
    public class GetMyNotificationsUseCase
    {
        private readonly INotificationRepository _notificationRepository;

        public GetMyNotificationsUseCase(INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task<IEnumerable<NotificationResponse>> ExecuteAsync(Guid userId, bool onlyUnread = false)
        {
            // 1. Declara una lista para guardar las notificaciones que vienen del repositorio.
            List<Notification>? notifications;

            // 2. Llama al método del repositorio correspondiente según el filtro.
            if (onlyUnread)
            {
                notifications = (await _notificationRepository.GetUnreadByUserIdAsync(userId))?.ToList();
            }
            else
            {
                notifications = (await _notificationRepository.GetByUserIdAsync(userId))?.ToList();
            }

            // 3. Mapea la lista de entidades de dominio a una lista de DTOs de respuesta.
            // Se usa 'Select' de LINQ para transformar cada elemento.
            return (notifications ?? new List<Notification>()).Select(n => new NotificationResponse
            {
                Id = n.Id,
                UserId = n.UserId,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            });
        }
    }
}