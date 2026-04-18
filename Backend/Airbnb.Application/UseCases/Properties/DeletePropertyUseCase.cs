using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using System;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.Properties
{
    public class DeletePropertyUseCase
    {
        private readonly IPropertyRepository _propertyRepository;

        public DeletePropertyUseCase(IPropertyRepository propertyRepository)
        {
            _propertyRepository = propertyRepository;
        }

        public async Task ExecuteAsync(Guid propertyId, Guid currentHostId)
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
                throw new UnauthorizedAccessException("No tienes permiso para eliminar una propiedad que no te pertenece.");
            }

            // 3. Eliminamos la propiedad
            await _propertyRepository.DeleteAsync(property);
        }
    }
}