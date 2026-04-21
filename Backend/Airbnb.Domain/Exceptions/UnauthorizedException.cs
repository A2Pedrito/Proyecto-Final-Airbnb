using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Exceptions
{
    /// Excepción que se lanza cuando una operación o acceso no está autorizado.
    public class UnauthorizedException : DomainExceptions
    {
        /// Inicializa una nueva instancia indicando el motivo de la falta de autorización.
        public UnauthorizedException(string message) : base(message)
        {

        }
    }
}
