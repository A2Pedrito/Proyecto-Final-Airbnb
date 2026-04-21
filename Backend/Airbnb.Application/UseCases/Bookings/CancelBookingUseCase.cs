using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using Airbnb.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Bookings
{
    public class CancelBookingUseCase
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IPropertyRepository _propertyRepository;
        private readonly INotificationRepository _notificationRepository;
        private readonly IEmailServices _emailServices;
        private readonly IUserRepository _userRepository;

        public CancelBookingUseCase(
            IBookingRepository bookingRepository,
            IPropertyRepository propertyRepository,
            INotificationRepository notificationRepository,
            IEmailServices emailServices,
            IUserRepository userRepository)
        {
            _bookingRepository = bookingRepository;
            _propertyRepository = propertyRepository;
            _notificationRepository = notificationRepository;
            _emailServices = emailServices;
            _userRepository = userRepository;
        }

        public async Task ExecuteAsync(Guid bookingId, Guid userId)
        {
            // 1. Buscar la reserva
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
                throw new NotFoundException("La reserva no fue encontrada.");

            // 2. Validar que el estado actual sea Confirmed
            if (booking.Status != BookingStatus.Confirmed)
                throw new DomainExceptions("Solo se pueden cancelar reservas que estén en estado confirmado.");

            // Para validar si el que cancela es el host, necesitamos la propiedad
            var property = await _propertyRepository.GetByIdAsync(booking.PropertyId);
            if (property == null)
                throw new NotFoundException("La propiedad asociada a esta reserva no fue encontrada.");

            // 3. Validar que quien cancela sea el Guest o el Host
            if (booking.GuestId != userId && property.HostId != userId)
                throw new DomainExceptions("No tienes permiso para cancelar esta reserva.");

            // 4. Cambiar estado a cancelado
            await _bookingRepository.CancelAsync(booking.Id);

            // 5. Generar notificaciones en un try/catch
            try
            {
                var hostNotification = new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = property.HostId,
                    Message = $"La reserva para tu propiedad '{property.Title}' ha sido cancelada.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                var guestNotification = new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = booking.GuestId,
                    Message = $"Tu reserva en la propiedad '{property.Title}' ha sido cancelada.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationRepository.AddAsync(hostNotification);
                await _notificationRepository.AddAsync(guestNotification);
                
                // Obtener a los usuarios de la BD para sacar sus emails
                var host = await _userRepository.GetByIdAsync(property.HostId);
                var guest = await _userRepository.GetByIdAsync(booking.GuestId);

                if (host != null && !string.IsNullOrEmpty(host.Email))
                    await _emailServices.SendBookingCancelledEmailAsync(host.Email, hostNotification.Message);
                if (guest != null && !string.IsNullOrEmpty(guest.Email))
                    await _emailServices.SendBookingCancelledEmailAsync(guest.Email, guestNotification.Message);
            }
            catch
            {
                // Si falla la notificación, no se interrumpe la cancelación
            }
        }
    }
}
