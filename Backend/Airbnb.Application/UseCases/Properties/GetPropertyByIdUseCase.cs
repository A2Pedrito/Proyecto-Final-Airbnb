using Airbnb.Application.DTOs.Property;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Properties
{
    public class GetPropertyByIdUseCase
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly IReviewRepository _reviewRepository;

        public GetPropertyByIdUseCase(IPropertyRepository propertyRepository, IReviewRepository reviewRepository)
        {
            _propertyRepository = propertyRepository;
            _reviewRepository = reviewRepository;
        }

        public async Task<PropertyResponse> ExecuteAsync(Guid id)
        {
            // Buscamos la propiedad específica
            var property = await _propertyRepository.GetByIdAsync(id);

            // Aplicamos la lógica de "Fail Fast" que vimos antes
            if (property == null)
            {
                // Lanzamos la excepción de dominio
                throw new NotFoundException($"La propiedad no fue encontrada. Favor de verificar el ID proporcionado.");
            }

            var averageRating = await _reviewRepository.GetAverageRatingByPropertyIdAsync(id);

            // Si existe, devolvemos el objeto mapeado
            return new PropertyResponse
            {
                Id = property.Id,
                Title = property.Title ?? string.Empty,
                Description = property.Description ?? string.Empty,
                Location = property.Location ?? string.Empty,
                PricePerNight = Math.Round(property.PricePerNight, 2),
                Capacity = property.Capacity,
                HostId = property.HostId,
                AverageRating = Math.Round(averageRating, 1)
            };
        }
    }
}
