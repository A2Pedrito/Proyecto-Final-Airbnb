using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Exceptions
{
    public class UnauthorizedException : DomainExceptions
    {
        public UnauthorizedException(string message) : base(message)
        {

        }
    }
}
