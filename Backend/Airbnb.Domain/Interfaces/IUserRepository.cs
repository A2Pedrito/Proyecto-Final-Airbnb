using Airbnb.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Interfaces
{
    public interface IUserRepository : IBaseRepository<User>
    {
        public Task<User?> GetByEmailAsync(string email);
    }

}
