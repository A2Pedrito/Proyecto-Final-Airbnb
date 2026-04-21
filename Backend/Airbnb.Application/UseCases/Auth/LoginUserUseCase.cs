﻿using Airbnb.Application.DTOs.Auth;
using Airbnb.Application.Interfaces;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Auth
{
    public class LoginUserUseCase
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtProvider _jwtProvider;

        public LoginUserUseCase(IUserRepository userRepository, IPasswordHasher passwordHasher, IJwtProvider jwtProvider)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _jwtProvider = jwtProvider;
        }

        public async Task<LoginResponse> ExecuteAsync(LoginRequest request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);
            
            // Para prevenir la enumeración de usuarios, no revelamos si el correo no existe
            // o si la contraseña es incorrecta. En ambos casos, el resultado es el mismo:
            // fallo de autenticación.
            if (user == null || !_passwordHasher.Verify(request.Password, user.PasswordHash!))
            {
                // Lanzamos la misma excepción genérica en ambos casos.
                // El código de estado HTTP 401 Unauthorized es el apropiado aquí.
                throw new UnauthorizedException("Correo o contraseña inválidos.");
            }

            if (!user.IsConfirmed)
            {
                throw new DomainExceptions("El correo no está confirmado");
            }

            string token = _jwtProvider.GenerateToken(user);

            return new LoginResponse
            {
                Token = token,
                Name = user.Name ?? string.Empty,
                Email = user.Email ?? string.Empty,
                Role = user.Role.ToString()
            };
        }
    }
}
