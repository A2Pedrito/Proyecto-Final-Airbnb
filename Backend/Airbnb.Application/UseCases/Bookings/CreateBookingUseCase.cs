using Airbnb.Application.DTOs.Booking;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;

namespace Airbnb.Application.UseCases.Bookings
{
    public class CreateBookingUseCase
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IPropertyRepository _propertyRepository;
        private readonly IBlockedDateRepository _blockedDateRepository;
        private readonly INotificationRepository _notificationRepository;

        public CreateBookingUseCase(
            IBookingRepository bookingRepository,
            IPropertyRepository propertyRepository,
            IBlockedDateRepository blockedDateRepository,
            INotificationRepository notificationRepository)
        {
            _bookingRepository = bookingRepository;
            _propertyRepository = propertyRepository;
            _blockedDateRepository = blockedDateRepository;
            _notificationRepository = notificationRepository;
        }

        public async Task<BookingResponse> ExecuteAsync(CreateBookingRequest request, Guid guestId)
        {
            // REGLA 1: Validar fechas lógicas
            if (request.CheckIn >= request.CheckOut)
                throw new DomainExceptions("La fecha de entrada debe ser anterior a la de salida.");

            // REGLA 2: La propiedad debe existir
            var property = await _propertyRepository.GetByIdAsync(request.PropertyId);
            if (property == null)
                throw new NotFoundException("La propiedad no fue encontrada.");

            // REGLA 3: El guest NO puede reservar su propia propiedad
            if (property.HostId == guestId)
                throw new DomainExceptions("No puedes reservar tu propia propiedad.");

            // REGLA 4: No debe haber reservas confirmadas que se solapen
            var overlapping = await _bookingRepository.GetOverlappingAsync(
                request.PropertyId, request.CheckIn, request.CheckOut);

            if (overlapping.Any())
                throw new ConflictException("La propiedad no está disponible en las fechas seleccionadas.");

            // REGLA 5: No deben existir fechas bloqueadas en ese rango
            var blockedDates = await _blockedDateRepository.GetByPropertyIdAsync(request.PropertyId);
            bool hasBlockedDate = blockedDates.Any(bd =>
                bd.Date >= request.CheckIn && bd.Date < request.CheckOut);

            if (hasBlockedDate)
                throw new ConflictException("La propiedad tiene fechas bloqueadas en ese rango.");

            // CREAR la reserva directamente en estado Confirmed
            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                PropertyId = request.PropertyId,
                GuestId = guestId,
                CheckIn = request.CheckIn,
                CheckOut = request.CheckOut,
                Status = BookingStatus.Confirmed
            };

            await _bookingRepository.AddAsync(booking);

            // NOTIFICACIÓN al host (no debe bloquear la operación)
            try
            {
                var notification = new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = property.HostId,
                    Message = $"Nueva reserva confirmada para tu propiedad '{property.Title}'.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                await _notificationRepository.AddAsync(notification);
            }
            catch { /* La notificación falla sin afectar la reserva */ }

            return new BookingResponse
            {
                Id = booking.Id,
                PropertyId = booking.PropertyId,
                GuestId = booking.GuestId,
                CheckIn = booking.CheckIn,
                CheckOut = booking.CheckOut,
                Status = booking.Status.ToString()
            };
        }
    }
}