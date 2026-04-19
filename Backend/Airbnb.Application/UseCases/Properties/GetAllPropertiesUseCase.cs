using Airbnb.Application.DTOs.Property;
using Airbnb.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Properties
{
    public class GetAllPropertiesUseCase
    {
        private readonly IPropertyRepository _propertyRepository;

        public GetAllPropertiesUseCase(IPropertyRepository propertyRepository)
        {
            _propertyRepository = propertyRepository;
        }

        /// <summary>
        /// Obtiene una lista de propiedades que coinciden con los criterios de búsqueda.
        /// Si los filtros son nulos, el repositorio devolverá todas las propiedades disponibles.
        /// </summary>
        /// <param name="filter">Objeto con los filtros (Location, CheckIn, CheckOut, Capacity, MaxPrice).</param>
        /// <returns>Lista de propiedades en formato DTO (PropertyResponse).</returns>
        public async Task<IEnumerable<PropertyResponse>> ExecuteAsync(PropertyFilterRequest filter)
        {
            // Llamamos al repositorio pasándole los filtros del request.
            var properties = await _propertyRepository.GetAvailableAsync(
                filter.Location, 
                filter.CheckIn, 
                filter.CheckOut, 
                filter.Capacity, 
                filter.MaxPrice);

            return properties.Select(p => new PropertyResponse
            {
                Id = p.Id,
                Title = p.Title ?? string.Empty,
                Description = p.Description ?? string.Empty,
                Location = p.Location ?? string.Empty,
                PricePerNight = p.PricePerNight,
                Capacity = p.Capacity,
                HostId = p.HostId
            });
        }
    }
}
