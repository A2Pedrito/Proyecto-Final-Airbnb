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
    public class BlockedDateRepository : BaseRepository<BlockedDate>, IBlockedDateRepository
    {
        public BlockedDateRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<BlockedDate>> GetByPropertyIdAsync(Guid propertyId)
        {
            return await _context.Set<BlockedDate>()
                                 .Where(b => b.PropertyId == propertyId)
                                 .ToListAsync();
        }
    }
}
