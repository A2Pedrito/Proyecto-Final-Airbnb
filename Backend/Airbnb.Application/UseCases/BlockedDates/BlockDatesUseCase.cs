using Airbnb.Domain.Entities;
using Airbnb.Domain.Exceptions;
using Airbnb.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Airbnb.Application.UseCases.BlockedDates
{
    public class BlockDatesUseCase
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly IBlockedDateRepository _blockedDateRepository;

        // Inyectamos los repositorios necesarios
        public BlockDatesUseCase(IPropertyRepository propertyRepository, IBlockedDateRepository blockedDateRepository)
        {
            _propertyRepository = propertyRepository;
            _blockedDateRepository = blockedDateRepository;
        }

        // Aquí es donde "recibe" los tres datos mencionados en la pista
        public async Task ExecuteAsync(Guid propertyId, Guid hostId, List<DateOnly> dates)
        {
            // 1. Verifica que la propiedad exista
            var property = await _propertyRepository.GetByIdAsync(propertyId);
            if (property == null)
            {
                throw new NotFoundException($"La propiedad con ID {propertyId} no existe.");
            }

            // 2. Verifica que el que intenta bloquear (hostId) sea el dueño de la propiedad
            if (property.HostId != hostId)
            {
                throw new UnauthorizedAccessException("No tienes permiso para bloquear fechas en una propiedad que no te pertenece.");
            }

            // 3. Un loop foreach para crear y guardar cada fecha
            foreach (var date in dates)
            {
                var blockedDate = new BlockedDate
                {
                    Id = Guid.NewGuid(),
                    PropertyId = propertyId,
                    Date = date 
                };

                await _blockedDateRepository.AddAsync(blockedDate);
            }
        }
    }
}