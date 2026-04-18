using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Application.Interfaces
{
    public interface IEmailServices
    {
        Task SendConfirmationEmailAsync(string email, string token);
    }
}
