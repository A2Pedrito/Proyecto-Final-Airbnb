using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Airbnb.Application.DTOs.BlokedDate
{
    public class BlockedDateRequest
    {
        [Required(ErrorMessage = "Debe proporcionar al menos una fecha para bloquear.")]
        public List<DateOnly> Dates { get; set; } = new List<DateOnly>();
    }
}