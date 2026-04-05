using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Entities
{
    public class Property : BaseEntity
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public decimal PricePerNight { get; set; }
        public int Capacity{ get; set; }

        public Guid HostId { get; set; }
        public User? Host { get; set; }
    }
}
