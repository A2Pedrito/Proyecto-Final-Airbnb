using Airbnb.Domain.Enum;
using System;
using System.Collections.Generic;
using System.Text;

namespace Airbnb.Domain.Entities
{
    public class User : BaseEntity
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public bool IsConfirmed { get; set; }
        public string? ConfirmationToken { get; set; }
        public DateTime? TokenExpiry { get; set; }
        public UserRole Role { get; set; } 
    }
}
