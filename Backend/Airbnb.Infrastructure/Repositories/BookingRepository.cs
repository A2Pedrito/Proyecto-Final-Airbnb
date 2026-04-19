using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Interfaces;
using Airbnb.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Infrastructure.Repositories
{
    public class BookingRepository : BaseRepository<Booking>, IBookingRepository
    {
        public BookingRepository(AppDbContext context) : base(context)
        {
        }

        public async Task CancelAsync(Guid bookingId)
        {
            var booking = await _context.Set<Booking>().FindAsync(bookingId);
            if (booking != null)
            {
                booking.Status = BookingStatus.Cancelled;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Booking>> GetByGuestIdAsync(Guid guestId)
        {
            return await _context.Set<Booking>()
                .Where(b => b.GuestId == guestId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetOverlappingAsync(Guid propertyId, DateOnly checkIn, DateOnly checkOut)
        {
            return await _context.Set<Booking>()
            .Where(b => b.PropertyId == propertyId &&
                        b.Status == BookingStatus.Confirmed &&
                        b.CheckIn < checkOut &&
                        b.CheckOut > checkIn)
            .ToListAsync();
        }
    }
}
