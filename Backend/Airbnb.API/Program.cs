
using Airbnb.Application.Interfaces;
using Airbnb.Application.UseCases.Auth;
using Airbnb.Domain.Interfaces;
using Airbnb.Infrastructure.Persistence;
using Airbnb.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Airbnb.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseMySql(
                    builder.Configuration.GetConnectionString("DefaultConnection"),
                    ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
                ));

            builder.Services.AddScoped<IPasswordHasher, IPasswordHasher>();
            builder.Services.AddScoped<IJwtProvider, IJwtProvider>();

            // Repositorios
            builder.Services.AddScoped<IUserRepository, UserRepository>();

            // Casos de Uso
            builder.Services.AddScoped<RegisterUserUseCase>();
            builder.Services.AddScoped<LoginUserUseCase>();
            builder.Services.AddScoped<ConfirmAccountUseCase>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
