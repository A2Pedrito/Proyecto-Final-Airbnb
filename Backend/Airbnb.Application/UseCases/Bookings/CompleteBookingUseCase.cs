using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using System;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Bookings
{
    public class CompleteBookingUseCase
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IPropertyRepository _propertyRepository;
        private readonly INotificationRepository _notificationRepository;

        public CompleteBookingUseCase(
            IBookingRepository bookingRepository,
            IPropertyRepository propertyRepository,
            INotificationRepository notificationRepository)
        {
            _bookingRepository = bookingRepository;
            _propertyRepository = propertyRepository;
            _notificationRepository = notificationRepository;
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

            // 4. Validar que la fecha de salida ya haya pasado (Hoy debe ser MAYOR al CheckOut)
            if (DateOnly.FromDateTime(DateTime.UtcNow) <= booking.CheckOut)
                throw new DomainExceptions("No se puede completar una reserva antes de su fecha de salida.");

            // 5. Cambiar estado y actualizar
            booking.Status = BookingStatus.Completed;
            await _bookingRepository.UpdateAsync(booking);

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
            }
            catch (Exception ex)
            {
                // Si falla la notificación, no se interrumpe el flujo
                Console.WriteLine($"Error al intentar crear las notificaciones: {ex.Message}");
            }
        }
    }
}
