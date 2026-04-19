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
using Airbnb.Domain.Exceptions;

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

        public async Task<Booking> CreateWithConcurrencyControlAsync(Booking booking)
        {
            using var transaction = await _context.Database.BeginTransactionAsync(
                System.Data.IsolationLevel.Serializable);
            try
            {
                // Re-verificar solapamiento DENTRO de la transacción
                var overlap = await _context.Set<Booking>()
                    .Where(b => b.PropertyId == booking.PropertyId &&
                                b.Status == BookingStatus.Confirmed &&
                                b.CheckIn < booking.CheckOut &&
                                b.CheckOut > booking.CheckIn)
                    .AnyAsync();

                if (overlap)
                    throw new ConflictException("La propiedad ya no está disponible.");

                _context.Set<Booking>().Add(booking);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return booking;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
