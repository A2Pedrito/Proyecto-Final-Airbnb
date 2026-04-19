
using Airbnb.API.Middlewares;
using Airbnb.Application.Interfaces;
using Airbnb.Application.UseCases.Auth;
using Airbnb.Application.UseCases.BlockedDates;
using Airbnb.Application.UseCases.Bookings;
using Airbnb.Application.UseCases.Notifications;
using Airbnb.Application.UseCases.Properties;
using Airbnb.Application.UseCases.Reviews;
using Airbnb.Domain.Interfaces;
using Airbnb.Infrastructure.Persistence;
using Airbnb.Infrastructure.Repositories;
using Airbnb.Infrastructure.Security;
using Airbnb.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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

            builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
            builder.Services.AddScoped<IJwtProvider, JwtProvider>();
            builder.Services.AddScoped<IEmailServices, EmailService>();

            // Repositorios
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
            builder.Services.AddScoped<IBookingRepository, BookingRepository>();
            builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
            builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
            builder.Services.AddScoped<IBlockedDateRepository, BlockedDateRepository>();


            // Casos de Uso
            builder.Services.AddScoped<RegisterUserUseCase>();
            builder.Services.AddScoped<LoginUserUseCase>();
            builder.Services.AddScoped<ConfirmAccountUseCase>();
            builder.Services.AddScoped<GetAllPropertiesUseCase>();
            builder.Services.AddScoped<GetPropertyByIdUseCase>();
            builder.Services.AddScoped<CreatePropertyUseCase>();
            builder.Services.AddScoped<UpdatePropertyUseCase>();
            builder.Services.AddScoped<DeletePropertyUseCase>();
            builder.Services.AddScoped<UnBlockedDatesUseCase>();
            builder.Services.AddScoped<BlockDatesUseCase>();
            builder.Services.AddScoped<GetPropertyReviewsUseCase>();
            builder.Services.AddScoped<CreateReviewUseCase>();
            builder.Services.AddScoped<CompleteBookingUseCase>();
            builder.Services.AddScoped<CancelBookingUseCase>();
            builder.Services.AddScoped<MarkNotificationAsReadUseCase>();
            builder.Services.AddScoped<GetMyNotificationsUseCase>();

            builder.Services.AddCors();

            // Configurar JWT
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options => {
                    options.TokenValidationParameters = new TokenValidationParameters {
                        ValidateIssuer = true, ValidateAudience = true,
                        ValidateLifetime = true, ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                    };
                });
            builder.Services.AddAuthorization();
            
            var app = builder.Build();

            // Configure the HTTP request pipeline.
            app.UseMiddleware<ExceptionMiddleware>();

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();
  
            app.UseCors(c => c.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

            app.UseAuthentication(); // antes de Authorization

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
