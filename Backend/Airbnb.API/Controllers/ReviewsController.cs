using Airbnb.Application.UseCases.Reviews;
using Airbnb.Application.DTOs.Review;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System;
using System.Threading.Tasks;

namespace Airbnb.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly CreateReviewUseCase _createReview;
        private readonly GetPropertyReviewsUseCase _getPropertyReviews;

        public ReviewsController(CreateReviewUseCase createReview, GetPropertyReviewsUseCase getPropertyReviews)
        {
            _createReview = createReview;
            _getPropertyReviews = getPropertyReviews;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReviewRequest request)
        {
            var guestIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(guestIdClaim, out Guid guestId))
            {
                return Unauthorized(new { message = "Token inválido o no contiene el ID del usuario." });
            }

            await _createReview.ExecuteAsync(request, guestId);
            
            return Ok(new { message = "Reseña creada exitosamente." });
        }

        [HttpGet("property/{propertyId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPropertyReviews(Guid propertyId)
        {
            var response = await _getPropertyReviews.ExecuteAsync(propertyId);
            
            return Ok(response);
        }
    }
}
