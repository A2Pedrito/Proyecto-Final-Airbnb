using Airbnb.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Interfaces
{
    public interface IBlockedDateRepository : IBaseRepository<BlockedDate>
    {
        public Task<IEnumerable<BlockedDate>> GetByPropertyIdAsync(Guid propertyId);
    }
}
