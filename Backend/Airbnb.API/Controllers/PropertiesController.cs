using Airbnb.Application.UseCases.Properties;
using Airbnb.Application.UseCases.BlockedDates;
using Airbnb.Application.DTOs.Property;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Airbnb.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    public class PropertiesController : ControllerBase
    {
        private readonly CreatePropertyUseCase _createProperty;
        private readonly UpdatePropertyUseCase _updateProperty;
        private readonly DeletePropertyUseCase _deleteProperty;
        private readonly GetAllPropertiesUseCase _getAllProperties;
        private readonly GetPropertyByIdUseCase _getPropertyById;
        private readonly BlockDatesUseCase _blockDates;
        private readonly UnBlockedDatesUseCase _unblockedDates;

        public PropertiesController(CreatePropertyUseCase createProperty, UpdatePropertyUseCase updateProperty, DeletePropertyUseCase deleteProperty, GetAllPropertiesUseCase getAllProperties, GetPropertyByIdUseCase getPropertyById, BlockDatesUseCase blockDates, UnBlockedDatesUseCase unblockedDates)
        {
            _createProperty = createProperty;
            _updateProperty = updateProperty;
            _deleteProperty = deleteProperty;
            _getAllProperties = getAllProperties;
            _getPropertyById = getPropertyById;
            _blockDates = blockDates;
            _unblockedDates = unblockedDates;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? location, 
            [FromQuery] DateOnly? checkIn, 
            [FromQuery] DateOnly? checkOut, 
            [FromQuery] int? capacity, 
            [FromQuery] decimal? maxPrice)
        {

            var filter = new PropertyFilterRequest
            {
                Location = location,
                CheckIn = checkIn,
                CheckOut = checkOut,
                Capacity = capacity,
                MaxPrice = maxPrice
            };

            var properties = await _getAllProperties.ExecuteAsync(filter);
            return Ok(properties);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var property = await _getPropertyById.ExecuteAsync(id);

            return Ok(property);
        }
        
        [HttpPost]
        [Authorize(Roles = "Host")]
        public async Task<IActionResult> Create([FromBody] CreatePropertyRequest request)
        {
            var hostIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(hostIdClaim, out Guid hostId))
            {
                return Unauthorized(new { message = "Token inválido o no contiene el ID del usuario." });
            }

            var propertyResponse = await _createProperty.ExecuteAsync(request, hostId);
            return CreatedAtAction(nameof(GetById), new { id = propertyResponse.Id }, propertyResponse);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Host")]
        public async Task<IActionResult> Update( Guid id, [FromBody] UpdatePropertyRequest request)
        {
            var hostIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(hostIdClaim, out Guid hostId))
            {
                return Unauthorized(new { message = "Token inválido o no contiene el ID del usuario." });
            }

            await _updateProperty.ExecuteAsync(id, hostId, request);

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Host")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var hostIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(hostIdClaim, out Guid hostId))
            {
                return Unauthorized(new { message = "Token inválido o no contiene el ID del usuario." });
            }

            await _deleteProperty.ExecuteAsync(id, hostId);
            return NoContent();
        }

        [HttpPost("{id}/block-dates")]
        [Authorize(Roles = "Host")]
        public async Task<IActionResult> BlockDates(Guid id, [FromBody] List<DateOnly> dates)
        {
            var hostIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(hostIdClaim, out Guid hostId))
            {
                return Unauthorized(new { message = "Token inválido o no contiene el ID del usuario." });
            }

            await _blockDates.ExecuteAsync(id, hostId, dates);
            return Ok(new { message = "Fechas bloqueadas exitosamente." });
        }

        [HttpPost("{id}/unblock-dates")]
        [Authorize(Roles = "Host")]
        public async Task<IActionResult> UnblockDates(Guid id, [FromBody] List<DateOnly> dates)
        {
            var hostIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(hostIdClaim, out Guid hostId))
            {
                return Unauthorized(new { message = "Token inválido o no contiene el ID del usuario." });
            }

            await _unblockedDates.ExecuteAsync(id, hostId, dates);
            return Ok(new { message = "Fechas desbloqueadas exitosamente." });
        }
    }
}