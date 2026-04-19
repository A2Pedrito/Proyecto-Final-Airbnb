using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Airbnb.Application.DTOs.Booking;
using Airbnb.Application.UseCases.Bookings;
using Airbnb.Application.Interfaces;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using Airbnb.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Airbnb.Infrastructure.Repositories;
using Moq;
using Xunit;

namespace Airbnb.Tests
{
    public class ConcurrencyTest
    {
        [Fact]
        public async Task CreateBooking_ConcurrentRequests_OnlyOneSucceeds()
        {
            // Arrange: Configurar los datos de prueba
            var propertyId = Guid.NewGuid();
            var guestId = Guid.NewGuid();
            var hostId = Guid.NewGuid(); // Debe ser diferente al guestId por validación
            var checkIn = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10));
            var checkOut = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(15));

            var request = new CreateBookingRequest
            {
                PropertyId = propertyId,
                CheckIn = checkIn,
                CheckOut = checkOut
            };

            var property = new Property
            {
                Id = propertyId,
                HostId = hostId,
                Title = "Test Property"
            };

            // Mocks de los repositorios inyectados en CreateBookingUseCase
            var mockPropertyRepo = new Mock<IPropertyRepository>();
            mockPropertyRepo.Setup(repo => repo.GetByIdAsync(propertyId)).ReturnsAsync(property);

            var mockBlockedDateRepo = new Mock<IBlockedDateRepository>();
            mockBlockedDateRepo.Setup(repo => repo.GetByPropertyIdAsync(propertyId))
                .ReturnsAsync(new List<BlockedDate>());

            var mockNotificationRepo = new Mock<INotificationRepository>();
            var mockEmailServices = new Mock<IEmailServices>();
            var mockUserRepo = new Mock<IUserRepository>();

            // Configuración de base de datos en memoria para control real de transacciones
            var connection = new Microsoft.Data.Sqlite.SqliteConnection("Data Source=:memory:");
            connection.Open();

            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlite(connection)
                .Options;

            var dbContext = new AppDbContext(options);
            await dbContext.Database.EnsureCreatedAsync(); // crea el esquema en SQLite
            var realBookingRepo = new BookingRepository(dbContext);

            var useCase = new CreateBookingUseCase(
                realBookingRepo, mockPropertyRepo.Object, mockBlockedDateRepo.Object,
                mockNotificationRepo.Object, mockEmailServices.Object, mockUserRepo.Object
            );

            // Act: Lanzar 5 tareas en paralelo para intentar reservar simultáneamente
            int numberOfConcurrentRequests = 5;
            var tasks = new List<Task<BookingResponse>>();

            for (int i = 0; i < numberOfConcurrentRequests; i++)
            {
                tasks.Add(Task.Run(() => useCase.ExecuteAsync(request, guestId)));
            }

            try
            {
                await Task.WhenAll(tasks);
            }
            catch
            {
                // Task.WhenAll lanza la primera excepción que encuentra, evaluaremos todas individualmente abajo
            }

            // Assert: Evaluar resultados
            var exceptions = new List<Exception>();
            var successfulResponses = new List<BookingResponse>();

            foreach (var task in tasks)
            {
                if (task.Status == TaskStatus.RanToCompletion) 
                    successfulResponses.Add(await task);
                else if (task.IsFaulted && task.Exception != null) 
                    exceptions.Add(task.Exception.InnerException ?? task.Exception);
            }

            Assert.Single(successfulResponses); // 1. Verifica que en la BD/memoria solo existe 1 reserva confirmada
            Assert.Equal(4, exceptions.Count);  // 2. Exactamente 4 de los 5 requests deben fallar
            Assert.All(exceptions, ex => Assert.IsType<ConflictException>(ex)); // 3. Deben fallar con ConflictException
        }
    }
}
