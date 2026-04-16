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
    public class ConfirmAccountUseCase
    {
        private readonly IUserRepository _userRepository;

        public ConfirmAccountUseCase(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<string> ExecuteAsync(string token)
        {
            var user = await _userRepository.GetByConfirmationTokenAsync(token);
            if (user == null)
            {
                throw new NotFoundException("No existe usuario con dicho token.");
            }

            if (user.TokenExpiry < DateTime.UtcNow)
            {
                throw new DomainExceptions("El enlace ha expirado. Por favor solicita uno nuevo.");
            }

            if (user.IsConfirmed == true)
            {
                throw new DomainExceptions("El usuario ya estaba confirmado.");
            }

            user.IsConfirmed = true;
            user.ConfirmationToken = null;
            user.TokenExpiry = null;

            await _userRepository.UpdateAsync(user);

            return "¡Cuenta confirmada exitosamente! Bienvenido a Airbnb.";
        }
    }
}
