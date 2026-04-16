using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Application.DTOs.Review
{
    public class CreateReviewRequest
    {
        public Guid BookingId { get; set; }

        [Range(1, 5, ErrorMessage = "La calificación debe ser entre 1 y 5 estrella.")]
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}
