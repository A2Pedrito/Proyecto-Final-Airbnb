using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Interfaces;
using Airbnb.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Infrastructure.Repositories
{
    public class PropertyRepository : BaseRepository<Property>, IPropertyRepository
    {
        public PropertyRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Property>> GetAvailableAsync(string? location, DateOnly? checkIn, DateOnly? checkOut, int? capacity, decimal? maxPrice)
        {
            IQueryable<Property> query = _context.Set<Property>().AsQueryable();
            
            if (location != null)
            {
                query = query.Where(p => p.Location != null && p.Location.Contains(location));
            }

            if (capacity != null)
            {
                query = query.Where(p => p.Capacity >= capacity);
            }

            if (maxPrice != null)
            {
                query = query.Where(p => p.PricePerNight <= maxPrice);
            }

            if (checkIn != null && checkOut != null)
            {
                query = query.Where(p =>
                    !_context.Set<Booking>().Any(b =>
                        b.PropertyId == p.Id &&
                        b.Status == BookingStatus.Confirmed &&
                        b.CheckIn < checkOut &&
                        b.CheckOut > checkIn)
                    
                    &&

                    !_context.Set<BlockedDate>().Any(bd =>
                        bd.PropertyId == p.Id &&
                        bd.Date >= checkIn &&
                        bd.Date < checkOut)
                );
            }

            return await query.ToListAsync();
        }
    }
}
