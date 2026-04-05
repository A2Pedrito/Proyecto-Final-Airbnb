using Airbnb.Domain.Enum;
using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Entities
{
    public class Booking : BaseEntity
    {
        public DateOnly CheckIn { get; set; }
        public DateOnly CheckOut { get; set; }

        public BookingStatus Status { get; set; }

        public Guid PropertyId { get; set; }
        public Property? Property { get; set; }

        public Guid GuestId { get; set; }
        public User? Guest { get; set; }

    }
}
