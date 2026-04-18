using Airbnb.Application.DTOs.Review;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Reviews
{
    /// <summary>
    /// Caso de uso para obtener todas las reseñas de una propiedad específica,
    /// junto con el promedio de calificación y el nombre del huésped que escribió cada reseña.
    /// </summary>
    public class GetPropertyReviewsUseCase
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IUserRepository _userRepository;

        public GetPropertyReviewsUseCase(IReviewRepository reviewRepository, IUserRepository userRepository)
        {
            _reviewRepository = reviewRepository;
            _userRepository = userRepository;
        }

        /// <summary>
        /// Ejecuta el caso de uso.
        /// </summary>
        /// <param name="propertyId">El ID de la propiedad de la cual se quieren obtener las reseñas.</param>
        /// <returns>Un objeto PropertyReviewsResponse que contiene el promedio de calificación y una lista de reseñas detalladas.</returns>
        public async Task<PropertyReviewsResponse> ExecuteAsync(Guid propertyId)
        {
            // 1. Llama al repositorio para obtener todas las reseñas de la propiedad.
            // Se usa el operador de coalescencia nula para asegurar que 'reviews' nunca sea nulo.
            var reviews = (await _reviewRepository.GetByPropertyIdAsync(propertyId))?.ToList() ?? new List<Review>();

            // 2. Calcula el promedio de calificación. Si no hay reseñas, el promedio es 0 para evitar errores.
            var averageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;

            // 3. Prepara la lista de DTOs de respuesta.
            // Este bucle es necesario para enriquecer cada reseña con el nombre del huésped.
            var reviewResponses = new List<ReviewResponse>();
            foreach (var review in reviews)
            {
                // Por cada reseña, se busca al usuario (huésped) correspondiente por su ID.
                // NOTA: Esto puede causar un problema de rendimiento N+1 si hay muchas reseñas,
                // ya que ejecuta una consulta a la base de datos por cada reseña.
                var guest = await _userRepository.GetByIdAsync(review.GuestId);
                reviewResponses.Add(new ReviewResponse
                {
                    // Se mapean los datos de la entidad de dominio (Review) al DTO de respuesta (ReviewResponse).
                    Id = review.Id,
                    GuestId = review.GuestId,
                    GuestName = guest?.Name ?? string.Empty,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt
                });
            }

            // 4. Construye el objeto de respuesta final.
            var response = new PropertyReviewsResponse
            {
                AverageRating = averageRating,
                Reviews = reviewResponses
            };

            return response;
        }
    }
}
