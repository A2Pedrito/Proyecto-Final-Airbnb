using Airbnb.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;

namespace Airbnb.API.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                int statusCode;

                switch (ex)
                {
                    case NotFoundException:
                        statusCode = StatusCodes.Status404NotFound;
                        break;
                    case UnauthorizedException:
                        statusCode = StatusCodes.Status401Unauthorized;
                        break;
                    case ConflictException:
                        statusCode = StatusCodes.Status409Conflict;
                        break;
                    case DomainExceptions:
                        statusCode = StatusCodes.Status400BadRequest;
                        break;
                    case UnauthorizedAccessException:
                        statusCode = StatusCodes.Status403Forbidden;
                        break;
                    default:
                        statusCode = StatusCodes.Status500InternalServerError;
                        break;
                }

                context.Response.StatusCode = statusCode;
                await context.Response.WriteAsJsonAsync(new { error = ex.Message });
            }
        }
    }
}
