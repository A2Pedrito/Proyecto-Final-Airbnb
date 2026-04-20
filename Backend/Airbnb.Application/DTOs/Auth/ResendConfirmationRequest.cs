using System.ComponentModel.DataAnnotations;

namespace Airbnb.Application.DTOs.Auth
{
    public class ResendConfirmationRequest
    {
        [Required(ErrorMessage = "El correo es obligatorio.")]
        [EmailAddress(ErrorMessage = "El formato del correo no es válido.")]
        public string Email { get; set; } = string.Empty;
    }
}
