using Airbnb.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Exceptions
{
    /// Clase base para todas las excepciones específicas del dominio.
    public class DomainExceptions : Exception
    {
        /// Inicializa una nueva instancia con un mensaje de error descriptivo.
        public DomainExceptions(string message) : base(message)
        {

        }
    }
}
