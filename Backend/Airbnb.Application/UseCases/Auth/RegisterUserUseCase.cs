using Airbnb.Application.DTOs.Auth;
using Airbnb.Application.Interfaces;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Auth
{
    public class RegisterUserUseCase
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IEmailServices _emailServices;

        public RegisterUserUseCase(IUserRepository userRepository, IPasswordHasher passwordHasher, IEmailServices emailServices)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _emailServices = emailServices;
        }

        public async Task<string> ExecuteAsync(RegisterRequest request)
        {
            if (request.Roles == null || !request.Roles.Any())
            {
                throw new DomainExceptions("Debes seleccionar al menos un rol.");
            }

            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                throw new ConflictException("Este correo ya está registrado en Airbnb.");
            }

            string hashedPassword = _passwordHasher.Hash(request.Password);

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Email = request.Email,
                PasswordHash = hashedPassword,
                Role = request.Roles.Aggregate((current, next) => current | next),
                IsConfirmed = false,
                ConfirmationToken = Guid.NewGuid().ToString(),
                TokenExpiry = DateTime.UtcNow.AddMinutes(10) // Corregido: Aumentar a 10 min para coincidir con el email
            };

            await _userRepository.AddAsync(newUser);

            // Imprimir el token en la consola para pruebas
            Console.WriteLine($"\n========================================");
            Console.WriteLine($"[NOTIFICACIÓN DE TOKEN] Usuario: {newUser.Email}");
            Console.WriteLine($"Token de confirmación: {newUser.ConfirmationToken}");
            Console.WriteLine($"========================================\n");

            try
            {
                await _emailServices.SendConfirmationEmailAsync(newUser.Email, newUser.ConfirmationToken!);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error enviando email: {ex.Message}");
            }

            return "Usuario registrado con éxito. Por favor verifica tu correo (el token se ha impreso en la consola).";
        }
    }
}
