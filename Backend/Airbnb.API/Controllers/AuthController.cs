using Airbnb.Application.UseCases.Auth;
using Airbnb.Application.DTOs.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airbnb.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly RegisterUserUseCase _register;
        private readonly ConfirmAccountUseCase _confirm;
        private readonly LoginUserUseCase _login;

        public AuthController(RegisterUserUseCase register, ConfirmAccountUseCase confirm, LoginUserUseCase login)
        {
            _register = register;
            _confirm = confirm;
            _login = login;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        { 
            var result = await _register.ExecuteAsync(request);
            return Ok(new { message = result }); 
        }

        [HttpGet("confirm")]
        public async Task<IActionResult> Confirm([FromQuery] string token)
        { 
            var result = await _confirm.ExecuteAsync(token);
            return Ok(new { message = result }); 
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        { 
            var result = await _login.ExecuteAsync(request);
            return Ok(result); 
        }

    }
}
