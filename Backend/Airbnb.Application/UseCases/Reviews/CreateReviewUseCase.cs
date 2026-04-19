using Airbnb.Application.DTOs.Review;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Enum;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using System;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Reviews
{
    public class CreateReviewUseCase
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IReviewRepository _reviewRepository;

        public CreateReviewUseCase(IBookingRepository bookingRepository, IReviewRepository reviewRepository)
        {
            _bookingRepository = bookingRepository;
            _reviewRepository = reviewRepository;
        }

        public async Task ExecuteAsync(CreateReviewRequest request, Guid guestId)
        {
            // 1. Busca la reserva por el ID proporcionado en el request
            var booking = await _bookingRepository.GetByIdAsync(request.BookingId);
            if (booking == null)
                throw new NotFoundException("La reserva no fue encontrada.");

            // 2. Valida que el usuario sea realmente el guest de esta reserva
            if (booking.GuestId != guestId)
                throw new DomainExceptions("Solo quien hizo la reserva puede dejar una reseña.");

            // 3. Validación clave: La reserva debe estar en estado Completed
            if (booking.Status != BookingStatus.Completed)
                throw new DomainExceptions("Solo puedes dejar una reseña en reservas que ya han sido completadas.");

            // 4. Crea el objeto Review usando los datos de la reserva y el request
            var review = new Review
            {
                Id = Guid.NewGuid(),
                PropertyId = booking.PropertyId, // Asignado a la propiedad de la reserva
                BookingId = request.BookingId,
                GuestId = guestId,
                Rating = request.Rating,         // Asumiendo que el DTO tiene este campo
                Comment = request.Comment,       // Asumiendo que el DTO tiene este campo
                CreatedAt = DateTime.UtcNow
            };

            // 5. Guarda la reseña en la base de datos
            await _reviewRepository.AddAsync(review);
        }
    }
}
