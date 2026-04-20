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
                Role = request.Role,
                IsConfirmed = false,
                ConfirmationToken = Guid.NewGuid().ToString(),
                TokenExpiry = DateTime.UtcNow.AddMinutes(2)
            };

            await _userRepository.AddAsync(newUser);

            try
            {
                await _emailServices.SendConfirmationEmailAsync(newUser.Email, newUser.ConfirmationToken!);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al intentar enviar el correo de confirmación a {newUser.Email}: {ex.Message}");
            }

            return "Usuario registrado con éxito. Por favor verifica tu correo.";
        }
    }
}
