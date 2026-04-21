using Airbnb.Application.Interfaces;
using System;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace Airbnb.Infrastructure.Services
{
    // Mailpit es un servidor de correo local para desarrollo.
    // Captura todos los emails enviados y los muestra en http://localhost:8025
    // Los emails NUNCA llegan a destinatarios reales — es solo para pruebas.
    //
    // Para instalarlo: https://mailpit.axllent.org/docs/install/
    // Windows: winget install axllent.mailpit
    // Mac:     brew install axllent/apps/mailpit
    // Linux:   descarga el binario de https://github.com/axllent/mailpit/releases
    //
    // Para correrlo: mailpit   (en una terminal aparte)
    // Panel web:     http://localhost:8025

    public class EmailService : IEmailServices
    {
        // Mailpit escucha en el puerto 1025 para SMTP por defecto
        private const string SmtpHost = "localhost";
        private const int SmtpPort = 1025;
        private const string FromAddress = "noreply@airbnbclone.com";
        private const string FromName = "Airbnb Clone";

        private readonly string _frontendBaseUrl;

        public EmailService(IConfiguration configuration)
        {
            var configuredBaseUrl = configuration["Frontend:BaseUrl"];
            _frontendBaseUrl = string.IsNullOrWhiteSpace(configuredBaseUrl)
                ? "http://localhost:5173"
                : configuredBaseUrl.TrimEnd('/');
        }

        private async Task SendEmailAsync(string to, string subject, string htmlBody)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(FromName, FromAddress));
                message.To.Add(MailboxAddress.Parse(to));
                message.Subject = subject;

                var builder = new BodyBuilder
                {
                    HtmlBody = htmlBody
                };
                message.Body = builder.ToMessageBody();

                using var client = new SmtpClient();

                // Conectar sin SSL/TLS, ya que Mailpit no lo usa por defecto.
                await client.ConnectAsync(SmtpHost, SmtpPort, false);

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                Console.WriteLine($"[EMAIL] Enviado a {to} — Asunto: {subject}");
            }
            catch (Exception ex)
            {
                // Si Mailpit no está corriendo, solo logea — no rompe el flujo
                Console.WriteLine($"[EMAIL ERROR] No se pudo enviar a {to}: {ex.Message}");
                Console.WriteLine("[EMAIL] ¿Está Mailpit corriendo? Ejecuta 'mailpit' en una terminal.");
                // Es importante relanzar la excepción para que el código que llama a este servicio
                // sepa que el correo no se pudo enviar y pueda manejar el error adecuadamente.
                throw;
            }
        }

        public Task SendConfirmationEmailAsync(string email, string token)
        {
            Console.WriteLine($"\n=======================================================\n[TOKEN DE CONFIRMACION] {token}\n=======================================================\n");

            var confirmUrl = $"{_frontendBaseUrl}/?confirmToken={Uri.EscapeDataString(token)}";
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
