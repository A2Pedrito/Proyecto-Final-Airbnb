using Airbnb.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Interfaces
{
    public interface IPropertyRepository : IBaseRepository<Property>
    {
        public Task<IEnumerable<Property>> GetAvailableAsync(string? location, DateOnly? checkIn, DateOnly? checkOut,
        int? capacity, decimal? maxPrice);
    }
}
