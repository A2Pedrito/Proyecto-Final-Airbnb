using Airbnb.Application.DTOs.Property;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using System;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Properties
{
    public class UpdatePropertyUseCase
    {
        private readonly IPropertyRepository _propertyRepository;

        public UpdatePropertyUseCase(IPropertyRepository propertyRepository)
        {
            _propertyRepository = propertyRepository;
        }

        public async Task ExecuteAsync(Guid propertyId, Guid currentHostId, UpdatePropertyRequest request)
        {
            // 1. Buscamos la propiedad
            var property = await _propertyRepository.GetByIdAsync(propertyId);

            if (property == null)
            {
                throw new NotFoundException($"La propiedad con ID {propertyId} no fue encontrada.");
            }

            // 2. Validación de Seguridad: ¿Es el dueño?
            if (property.HostId != currentHostId)
            {
                // Usamos la excepción nativa de .NET para accesos no autorizados
                throw new UnauthorizedAccessException("No tienes permiso para modificar una propiedad que no te pertenece.");
            }

            // 3. Actualizamos solo los campos permitidos (Location no se toca)
            property.Title = request.Title;
            property.Description = request.Description;
            property.Location = request.Location;
            property.PricePerNight = request.PricePerNight;
            property.Capacity = request.Capacity;

            // 4. Guardamos los cambios en la base de datos
            await _propertyRepository.UpdateAsync(property);
        }
    }
}