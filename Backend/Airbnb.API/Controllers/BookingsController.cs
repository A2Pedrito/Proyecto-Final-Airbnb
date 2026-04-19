using Airbnb.Application.UseCases.Bookings;
using Airbnb.Application.DTOs.Booking;
using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Airbnb.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly CreateBookingUseCase _createBooking;
        private readonly CancelBookingUseCase _cancelBooking;
        private readonly CompleteBookingUseCase _completeBooking;
    
        public BookingsController(CreateBookingUseCase createBooking, CancelBookingUseCase cancelBooking, CompleteBookingUseCase completeBooking)
        {
            _createBooking = createBooking;
            _cancelBooking = cancelBooking;
            _completeBooking = completeBooking;
        }
    
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBookingRequest request)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out Guid userId))
                return Unauthorized(new { message = "Token inválido o no contiene el ID del usuario." });

            var response = await _createBooking.ExecuteAsync(request, userId);
            return Ok(response);
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out Guid userId))
                return Unauthorized(new { message = "Token inválido o no contiene el ID del usuario." });

            await _cancelBooking.ExecuteAsync(id, userId);
            return Ok(new { message = "Reserva cancelada exitosamente." });
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> Complete(Guid id)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out Guid userId))
                return Unauthorized(new { message = "Token inválido o no contiene el ID del usuario." });

            await _completeBooking.ExecuteAsync(id, userId);
            return Ok(new { message = "Reserva completada exitosamente." });
        }
    }
}
