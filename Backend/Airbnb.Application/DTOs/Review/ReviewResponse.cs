using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Application.DTOs.Review
{
    public class ReviewResponse
    {
        public Guid Id { get; set; }
        public Guid GuestId { get; set; }
        public string GuestName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}
