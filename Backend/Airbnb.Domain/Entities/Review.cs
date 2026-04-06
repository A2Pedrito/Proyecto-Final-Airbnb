using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Entities
{
    public class Review: BaseEntity
    {
        public Guid BookingId { get; set; }
        public Booking? Booking { get; set; }

        public Guid GuestId { get; set; }
        public User? Guest { get; set; }

        public Guid PropertyId { get; set; }
        public Property? Property { get; set; }

        public int Rating { get; set; }
        public string? Comment { get; set; }

    }
}
