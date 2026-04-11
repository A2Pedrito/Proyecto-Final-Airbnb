using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Application.DTOs.Booking
{
    public class BookingResponse
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        public Guid GuestId { get; set; }

        public DateOnly CheckIn { get; set; }
        public DateOnly CheckOut { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}
