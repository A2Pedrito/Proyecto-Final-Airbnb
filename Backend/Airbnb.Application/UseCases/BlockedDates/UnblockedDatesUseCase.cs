using Airbnb.Domain.Entities;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.BlockedDates
{
    public class UnBlockedDatesUseCase
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly IBlockedDateRepository _blockedDateRepository;

        // Inyectamos los repositorios necesarios
        public UnBlockedDatesUseCase(IPropertyRepository propertyRepository, IBlockedDateRepository blockedDateRepository)
        {
            _propertyRepository = propertyRepository;
            _blockedDateRepository = blockedDateRepository;
        }

        // Aquí es donde "recibe" los tres datos mencionados en la pista
        public async Task ExecuteAsync(Guid propertyId, Guid hostId, List<DateOnly> dates)
        {
            // 1. Verifica que la propiedad exista
            var Blockedproperty = await _propertyRepository.GetByIdAsync(propertyId);
            if (Blockedproperty == null)
            {
                throw new NotFoundException($"La propiedad con ID {propertyId} no existe.");
            }

            // 2. Validación de Ownership: Verifica que el Host que hace la petición sea el dueño real de la propiedad
            if (Blockedproperty.HostId != hostId)
            {
                throw new UnauthorizedAccessException("No tienes permiso para desbloquear fechas en una propiedad que no te pertenece.");
            }

            // 3. Itera sobre la lista de fechas enviadas por el Host para buscar coincidencias
            foreach (var date in dates)
            {
                // Busca el registro específico de BlockedDate para esta propiedad y esta fecha
                var blockedDate = await _blockedDateRepository.GetByDateAsync(propertyId, date);

                // Si la fecha realmente estaba bloqueada (se encontró en la BD), se procede a eliminarla
                if (blockedDate != null)
                {
                    await _blockedDateRepository.DeleteAsync(blockedDate);
                }
            }

        }
    }
}