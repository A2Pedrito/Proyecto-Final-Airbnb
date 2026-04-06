using Airbnb.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Exceptions
{
    public class DomainExceptions : Exception
    {
        public DomainExceptions(string message) : base(message)
        {

        }
    }
}
