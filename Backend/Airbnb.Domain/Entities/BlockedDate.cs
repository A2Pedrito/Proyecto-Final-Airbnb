using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Entities
{
    public class BlockedDate : BaseEntity
    {
        public DateOnly Date { get; set; }

        public Guid PropertyId { get; set; }
        public Property? Property { get; set; }
    }
}
