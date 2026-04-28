using Airbnb.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Interfaces
{
    public interface IBookingRepository : IBaseRepository<Booking>
    {
        /// Obtiene todas las reservas que se solapan con un rango de fechas para una propiedad.
        Task<IEnumerable<Booking>> GetOverlappingAsync(Guid propertyId, DateOnly checkIn, DateOnly checkOut);

        // Obtiene todas las reservas de una propiedad específica.
        Task<IEnumerable<Booking>> GetByPropertyIdAsync(Guid propertyId);

        // Obtiene todas las reservas realizadas por un huésped específico.
        Task<IEnumerable<Booking>> GetByGuestIdAsync(Guid guestId);

    }
}
