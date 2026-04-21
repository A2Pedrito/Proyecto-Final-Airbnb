using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Enum
{
    [Flags]
    public enum UserRole
    {
        Host = 1,
        Guest = 2
    }
}
