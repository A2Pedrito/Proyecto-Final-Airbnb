using Airbnb.Application.Interfaces;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using System;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Auth
{
    public class ResendConfirmationUseCase
    {
        private readonly IUserRepository _userRepository;
        private readonly IEmailServices _emailServices;

        public ResendConfirmationUseCase(IUserRepository userRepository, IEmailServices emailServices)
        {
            _userRepository = userRepository;
            _emailServices = emailServices;
        }

        public async Task<string> ExecuteAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);

            // Por seguridad, no revelamos si el correo existe o no.
            // Simplemente retornamos un mensaje genérico para evitar enumeración de usuarios.
            if (user == null)
            {
                return "Se ha enviado un nuevo enlace de confirmación.";
            }

            if (user.IsConfirmed)
            {
                throw new DomainExceptions("Esta cuenta ya ha sido confirmada.");
            }

            // Generamos un nuevo token y fecha de expiración
            user.ConfirmationToken = Guid.NewGuid().ToString();
            user.TokenExpiry = DateTime.UtcNow.AddMinutes(10);

            await _userRepository.UpdateAsync(user);

            // Opcional: Imprimir en consola para facilitar las pruebas
            Console.WriteLine($"[DEBUG] Nuevo token de confirmación para {user.Email}: {user.ConfirmationToken}");

            await _emailServices.SendConfirmationEmailAsync(user.Email!, user.ConfirmationToken!);

            return "Se ha enviado un nuevo enlace de confirmación.";
        }
    }
}
