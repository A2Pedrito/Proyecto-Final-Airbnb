using Airbnb.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Infrastructure.Security
{
    /// Servicio encargado de encriptar y verificar contraseñas utilizando el algoritmo BCrypt.
    public class PasswordHasher : IPasswordHasher
    {
        /// Encripta una contraseña en texto plano y devuelve su hash seguro.
        public string Hash(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        /// Verifica si una contraseña en texto plano coincide con un hash almacenado previamente.
        public bool Verify(string password, string passwordHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
    }
}
