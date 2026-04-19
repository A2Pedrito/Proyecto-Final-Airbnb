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

        public Task SendBookingCreatedEmailAsync(string email, string message)
        {
            Console.WriteLine("========== EMAIL SIMULADO ==========");
            Console.WriteLine($"Destinatario: {email}");
            Console.WriteLine($"Mensaje: {message}");
            Console.WriteLine("====================================");

            return Task.CompletedTask;
        }

        public Task SendBookingCancelledEmailAsync(string email, string message)
        {
            Console.WriteLine("========== EMAIL SIMULADO ==========");
            Console.WriteLine($"Destinatario: {email}");
            Console.WriteLine($"Mensaje: {message}");
            Console.WriteLine("====================================");

            return Task.CompletedTask;
        }

        public Task SendBookingCompletedEmailAsync(string email, string message)
        {
            Console.WriteLine("========== EMAIL SIMULADO ==========");
            Console.WriteLine($"Destinatario: {email}");
            Console.WriteLine($"Mensaje: {message}");
            Console.WriteLine("====================================");

            return Task.CompletedTask;
        }
    }
}
