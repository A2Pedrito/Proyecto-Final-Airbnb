using Airbnb.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Interfaces
{
    public interface IBookingRepository : IBaseRepository<Booking>
    {
        public Task<IEnumerable<Booking>> GetOverlappingAsync(Guid propertyId, DateOnly checkIn, DateOnly checkOut);
        public Task<IEnumerable<Booking>> GetByGuestIdAsync(Guid guestId);
    }
}
