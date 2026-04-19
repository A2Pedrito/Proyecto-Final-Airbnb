using System;

namespace Airbnb.Application.DTOs.BlockedDate
{
    public class BlockedDataResponse
    {
        public Guid Id {get; set;}
        public Guid PropertyId { get; set;}
        public DateOnly Date {get; set;}
    }
}