using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Application.DTOs.Property
{
    public class UpdatePropertyRequest
    {
        [Required(ErrorMessage = "El titulo es obligatorio.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "La descripción es obligatoria.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "La ubicación es obligatoria.")]
        public string Location { get; set; } = string.Empty;

        [Range(1.0, 10000.0, ErrorMessage = "El precio por noche debe ser mayor a 0.")]
        public decimal PricePerNight { get; set; }

        [Range(1, 50, ErrorMessage = "La capacidad debe ser entre 1 y 50 huéspedes.")]
        public int Capacity { get; set; }
    }
}
