using Airbnb.Domain.Entities;
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
    public class ReviewRepository : BaseRepository<Review>, IReviewRepository
    {
        public ReviewRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Review>> GetByPropertyIdAsync(Guid propertyId)
        {
            return await _context.Set<Review>()
                                 .Where(r => r.PropertyId == propertyId)
                                 .ToListAsync();
        }

        public async Task<decimal> GetAverageRatingByPropertyIdAsync(Guid propertyId)
        {
            var ratings = await _context.Set<Review>()
                                        .Where(r => r.PropertyId == propertyId)
                                        .Select(r => r.Rating)
                                        .ToListAsync();
            
            if (!ratings.Any()) return 0;
            return (decimal)ratings.Average();
        }
    }
}
