using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Interfaces
{
    public interface IBaseRepository<T>
    {
        public Task<T?> GetByIdAsync(Guid id);
        public Task<IEnumerable<T>> GetAllAsync();
        public Task AddAsync(T entity);
        public Task UpdateAsync(T entity);
        public Task DeleteAsync(T entity);

    }
}
