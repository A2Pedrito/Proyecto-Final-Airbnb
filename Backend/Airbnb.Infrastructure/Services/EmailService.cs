using Airbnb.Application.Interfaces;
using System;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace Airbnb.Infrastructure.Services
{
    /// <summary>
    /// Servicio para el envío de correos electrónicos usando Mailpit como servidor SMTP de desarrollo
    /// </summary>
    public class EmailService : IEmailServices
    {
        // ==================== CONSTANTES ====================
        private const string SmtpHost = "localhost";
        private const int SmtpPort = 1025;
        private const string FromAddress = "noreply@airbnbclone.com";
        private const string FromName = "Airbnb Clone";

        // ==================== CAMPOS PRIVADOS ====================
        private readonly string _frontendBaseUrl;

        // ==================== CONSTRUCTOR ====================
        public EmailService(IConfiguration configuration)
        {
            // 🔍 LEE la configuración desde appsettings.json
            var configuredBaseUrl = configuration["Frontend:BaseUrl"];
            
            // 🎯 ASIGNA un valor por defecto si no existe configuración
            _frontendBaseUrl = string.IsNullOrWhiteSpace(configuredBaseUrl)
                ? "http://localhost:5173"  // Valor por defecto (Vite/React)
                : configuredBaseUrl.TrimEnd('/');  // Elimina '/' final si existe
        }

        // ==================== MÉTODOS PRIVADOS ====================
        private async Task SendEmailAsync(string to, string subject, string htmlBody)
        {
            try
            {
                // 1. CONSTRUIR el mensaje
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(FromName, FromAddress));
                message.To.Add(MailboxAddress.Parse(to));
                message.Subject = subject;

                var builder = new BodyBuilder
                {
                    HtmlBody = htmlBody
                };
                message.Body = builder.ToMessageBody();

                // 2. ENVIAR usando SMTP
                using var client = new SmtpClient();
                await client.ConnectAsync(SmtpHost, SmtpPort, false); 
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                // 3. REGISTRO de éxito
                Console.WriteLine($"[EMAIL] Enviado a {to} — Asunto: {subject}");
            }
            catch (Exception ex)
            {
                // 4. REGISTRO de error
                Console.WriteLine($"[EMAIL ERROR] No se pudo enviar a {to}: {ex.Message}");
                Console.WriteLine("[EMAIL] ¿Está Mailpit corriendo? Ejecuta 'mailpit' en una terminal.");
                
                // 5. RELANZAR la excepción para que el llamador sepa que falló
                throw;
            }
        }

        // ==================== MÉTODOS PÚBLICOS ====================
        
        public Task SendConfirmationEmailAsync(string email, string token)
        {
            // 📝 LOG para debugging (útil en desarrollo)
            Console.WriteLine($"\n=======================================================");
            Console.WriteLine($"[TOKEN DE CONFIRMACION] {token}");
            Console.WriteLine($"=======================================================\n");

            // 🔗 CONSTRUYE la URL usando _frontendBaseUrl (¡AQUÍ se usa!)
            var confirmUrl = $"{_frontendBaseUrl}/?confirmToken={Uri.EscapeDataString(token)}";
            
            // 📧 CONSTRUYE el HTML del correo
            var html = $@"
                <div style='font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #ddd;border-radius:8px;'>
                    <h2 style='color:#e11d48;'>🏠 Airbnb Clone</h2>
                    <h3>Confirma tu cuenta</h3>
                    <p><strong>Mensaje:</strong> Haz clic en el botón para activar tu cuenta. El enlace expira en 10 minutos.</p>
                    <p><strong>Fecha de creación:</strong> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
                    <p><strong>Usuario destinatario:</strong> {email}</p>
                    <a href='{confirmUrl}'
                       style='display:inline-block;background:#e11d48;color:white;padding:12px 24px;
                              border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;'>
                        Confirmar cuenta
                    </a>
                    <p style='color:#888;font-size:12px;'>O copia este enlace: {confirmUrl}</p>
                </div>";

            // ✉️ ENVÍA el correo
            return SendEmailAsync(email, "Confirma tu cuenta en Airbnb Clone", html);
        }

        public Task SendBookingCreatedEmailAsync(string email, string message)
        {
            var html = $@"
                <div style='font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #ddd;border-radius:8px;'>
                    <h2 style='color:#e11d48;'>🏠 Airbnb Clone</h2>
                    <h3>Nueva reserva confirmada</h3>
                    <p><strong>Mensaje:</strong> {message}</p>
                    <p><strong>Fecha de creación:</strong> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
                    <p><strong>Usuario destinatario:</strong> {email}</p>
                </div>";

            return SendEmailAsync(email, "Nueva reserva en tu propiedad", html);
        }

        public Task SendBookingCancelledEmailAsync(string email, string message)
        {
            var html = $@"
                <div style='font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #ddd;border-radius:8px;'>
                    <h2 style='color:#e11d48;'>🏠 Airbnb Clone</h2>
                    <h3>Reserva cancelada</h3>
                    <p><strong>Mensaje:</strong> {message}</p>
                    <p><strong>Fecha de creación:</strong> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
                    <p><strong>Usuario destinatario:</strong> {email}</p>
                </div>";

            return SendEmailAsync(email, "Tu reserva fue cancelada", html);
        }

        public Task SendBookingCompletedEmailAsync(string email, string message)
        {
            var html = $@"
                <div style='font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #ddd;border-radius:8px;'>
                    <h2 style='color:#e11d48;'>🏠 Airbnb Clone</h2>
                    <h3>Estadía completada</h3>
                    <p><strong>Mensaje:</strong> {message}</p>
                    <p><strong>Fecha de creación:</strong> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
                    <p><strong>Usuario destinatario:</strong> {email}</p>
                    <p>¡No olvides dejar una reseña!</p>
                </div>";

            return SendEmailAsync(email, "Tu estadía ha finalizado", html);
        }
    }
}