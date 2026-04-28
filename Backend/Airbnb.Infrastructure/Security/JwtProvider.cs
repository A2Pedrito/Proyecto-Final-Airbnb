using Airbnb.Application.Interfaces;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Airbnb.Infrastructure.Security
{
    /// Proveedor encargado de generar los tokens JWT para la autenticación y autorización de usuarios.
    public class JwtProvider : IJwtProvider
    {
        private readonly IConfiguration _config;
        public JwtProvider(IConfiguration config) 
        {
            _config = config;
        }

        /// Genera un token JWT válido para el usuario especificado, asignando sus respectivos roles y claims.
        public string GenerateToken(User user)
        {
            // Convierte la clave secreta en un arreglo de bytes y crea una llave de seguridad simétrica.
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            // Crea las credenciales de firma aplicando el algoritmo de encriptación seguro HmacSha256.
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            // Inicia una lista de claims guardando el ID único del usuario y su correo electrónico.
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
            };

            // Si el usuario tiene el rol de "Anfitrión" (Host), lo añade a la lista de claims.
            if (user.Role.HasFlag(UserRole.Host))
            {
                claims.Add(new Claim(ClaimTypes.Role, UserRole.Host.ToString()));
            }

            // Si el usuario tiene el rol de "Invitado" (Guest), lo añade a los claims.
            if (user.Role.HasFlag(UserRole.Guest))
            {
                claims.Add(new Claim(ClaimTypes.Role, UserRole.Guest.ToString()));
            }

            // Si no se asignó ningún rol, asigna el rol de "Invitado" (Guest) por defecto por seguridad.
            if (!claims.Any(c => c.Type == ClaimTypes.Role))
            {
                claims.Add(new Claim(ClaimTypes.Role, UserRole.Guest.ToString()));
            }

            // Construye el token JWT con sus datos, emisor, audiencia, expiración (8 horas) y credenciales.
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"], audience: _config["Jwt:Audience"],
                claims: claims, expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds);
            // Serializa el token construido transformándolo en una cadena de texto para devolverlo al cliente.
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
