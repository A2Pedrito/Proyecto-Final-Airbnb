using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Application.DTOs.Property
{
    public class PropertyFilterRequest
    {
        public string? Location { get; set; } = string.Empty;
        public DateOnly? CheckIn { get; set; }
        public DateOnly? CheckOut { get; set; }
        public int? Capacity { get; set; }
        public decimal? MaxPrice { get; set; }
    }
}
