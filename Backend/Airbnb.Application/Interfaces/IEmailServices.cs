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
        Task SendBookingCreatedEmailAsync(string email, string message);
        Task SendBookingCancelledEmailAsync(string email, string message);
        Task SendBookingCompletedEmailAsync(string email, string message);
    }
}
