using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Exceptions
{
    public class NotFoundException : DomainExceptions
    {
        public NotFoundException(string message) : base(message)
        {

        }
    }
}
