using Airbnb.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Interfaces
{
    public interface INotificationRepository : IBaseRepository<Notification>
    {
        public Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId);
        public Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(Guid userId);
    }
}
