using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Exceptions
{
    public class ConflictException : DomainExceptions
    {
        public ConflictException(string message) : base(message)
        {

        }
    }
}
