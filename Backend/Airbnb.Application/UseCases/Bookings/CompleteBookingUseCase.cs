using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using Airbnb.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Bookings
{
    public class CompleteBookingUseCase
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IPropertyRepository _propertyRepository;
        private readonly INotificationRepository _notificationRepository;
        private readonly IEmailServices _emailServices;
        private readonly IUserRepository _userRepository;

        public CompleteBookingUseCase(
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
                throw new DomainExceptions("Solo se pueden completar reservas que estén en estado confirmado. Otras transiciones no están permitidas.");

            // Para validar permisos, necesitamos la propiedad
            var property = await _propertyRepository.GetByIdAsync(booking.PropertyId);
            if (property == null)
                throw new NotFoundException("La propiedad asociada a esta reserva no fue encontrada.");

            // 3. Validar permisos: quién completa debe ser el host o el guest
            if (booking.GuestId != userId && property.HostId != userId)
                throw new DomainExceptions("No tienes permiso para completar esta reserva.");

            // 4. (Opcional) Si la fecha de salida aún no ha pasado y se completa la reserva,
            // el repositorio se encargará de ajustar la fecha de CheckOut al día de hoy
            // para reflejar que la estadía terminó de forma anticipada.

            // 5. Cambiar estado y actualizar
            await _bookingRepository.CompleteAsync(booking.Id);

            // 6. Notificar al guest en un try/catch
            try
            {
                var guestNotification = new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = booking.GuestId,
                    Message = $"Tu estadía en la propiedad '{property.Title}' ha finalizado. ¡Ya puedes dejar una reseña!",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationRepository.AddAsync(guestNotification);
                
                // Buscar al guest para enviarle el correo real
                var guest = await _userRepository.GetByIdAsync(booking.GuestId);
                if (guest != null && !string.IsNullOrEmpty(guest.Email))
                {
                    await _emailServices.SendBookingCompletedEmailAsync(guest.Email, guestNotification.Message);
                }
            }
            catch (Exception ex)
            {
                // Si falla la notificación, no se interrumpe el flujo
                Console.WriteLine($"Error al intentar crear las notificaciones: {ex.Message}");
            }
        }
    }
}
