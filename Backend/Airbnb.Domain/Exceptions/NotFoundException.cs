using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Exceptions
{
    /// Excepción que se lanza cuando no se encuentra una entidad o recurso solicitado.
    public class NotFoundException : DomainExceptions
    {
        /// Inicializa una nueva instancia indicando el motivo por el cual no se encontró el recurso.
        public NotFoundException(string message) : base(message)
        {

        }
    }
}
