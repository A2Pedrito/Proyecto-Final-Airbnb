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
    public class MarkNotificationAsReadUseCase
    {
        private readonly INotificationRepository _notificationRepository;

        public MarkNotificationAsReadUseCase(INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task ExecuteAsync(Guid notificationId, Guid userId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);
            if (notification == null || notification.UserId != userId)
            {
                throw new NotFoundException("Notificación no encontrada o no pertenece a la usuaria.");
            }

            if (notification.UserId != userId)
            {
                throw new UnauthorizedAccessException("No tiene permisos para marcar esta notificación como leída.");
            }

            notification.IsRead = true;

            await _notificationRepository.UpdateAsync(notification);
        }
    }
}
