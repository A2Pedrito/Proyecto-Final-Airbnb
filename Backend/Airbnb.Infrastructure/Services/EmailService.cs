using Airbnb.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace Airbnb.Infrastructure.Services
{
    public class EmailService : IEmailServices
    {
        public Task SendConfirmationEmailAsync(string email, string token)
        {
            Console.WriteLine("========== EMAIL SIMULADO ==========");
            Console.WriteLine($"Destinatario: {email}");
            Console.WriteLine($"Token de confirmación: {token}");
            Console.WriteLine("====================================");
            
            return Task.CompletedTask;
        }
    }
}
