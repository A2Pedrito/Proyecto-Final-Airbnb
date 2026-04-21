using Airbnb.Application.DTOs.Booking;
using Airbnb.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Bookings
{
    public class GetMyBookingsUseCase
    {
        private readonly IBookingRepository _bookingRepository;

        public GetMyBookingsUseCase(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        public async Task<IEnumerable<BookingResponse>> ExecuteAsync(Guid guestId)
        {
            var bookings = await _bookingRepository.GetByGuestIdAsync(guestId);

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