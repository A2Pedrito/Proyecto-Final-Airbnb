using Airbnb.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Interfaces
{
    public interface IReviewRepository : IBaseRepository<Review>
    {
        public Task<IEnumerable<Review>> GetByPropertyIdAsync(Guid propertyId);
        public Task<decimal> GetAverageRatingByPropertyIdAsync(Guid propertyId);
    }
}
