using Airbnb.Application.DTOs.Property;
using Airbnb.Domain.Entities;
using Airbnb.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Properties
{
    public class CreatePropertyUseCase
    {
        private readonly IPropertyRepository _propertyRepository;

        public CreatePropertyUseCase(IPropertyRepository propertyRepository)
        {
            _propertyRepository = propertyRepository;
        }

        public async Task<PropertyResponse> ExecuteAsync(CreatePropertyRequest request, Guid hostId)
        {
            var property = new Property
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                Location = request.Location,
                PricePerNight = request.PricePerNight,
                Capacity = request.Capacity,
                HostId = hostId // <--- Asignamos el ID seguro que viene del Token
            };

            await _propertyRepository.AddAsync(property);

            return new PropertyResponse
            {
                Id = property.Id,
                Title = property.Title,
                Description = property.Description, 
                Location = property.Location,
                PricePerNight = Math.Round(property.PricePerNight, 2),
                Capacity = property.Capacity,
                HostId = property.HostId
            };
        }
    }
}
