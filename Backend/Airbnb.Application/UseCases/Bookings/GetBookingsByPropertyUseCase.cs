
using Airbnb.Application.DTOs.Booking;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Bookings
{
    public class GetBookingsByPropertyUseCase
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IPropertyRepository _propertyRepository;

        public GetBookingsByPropertyUseCase(IBookingRepository bookingRepository, IPropertyRepository propertyRepository)
        {
            _bookingRepository = bookingRepository;
            _propertyRepository = propertyRepository;
        }

        public async Task<IEnumerable<BookingResponse>> ExecuteAsync(Guid propertyId, Guid hostId)
        {
            var property = await _propertyRepository.GetByIdAsync(propertyId);
            if (property == null)
                throw new NotFoundException("La propiedad no fue encontrada.");

            if (property.HostId != hostId)
                throw new DomainExceptions("No tienes permiso para ver estas reservas.");

            var bookings = await _bookingRepository.GetByPropertyIdAsync(propertyId);

            return bookings.Select(b => new BookingResponse
            {
                Id = b.Id,
                PropertyId = b.PropertyId,
                GuestId = b.GuestId,
                CheckIn = b.CheckIn,
                CheckOut = b.CheckOut,
                Status = b.Status.ToString()
            });
        }
    }
}
