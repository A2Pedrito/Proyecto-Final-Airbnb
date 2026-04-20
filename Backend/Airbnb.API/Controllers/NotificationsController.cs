using Airbnb.Application.UseCases.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Airbnb.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly GetMyNotificationsUseCase _getMyNotifications;
        private readonly MarkNotificationAsReadUseCase _markNotificationAsRead;

        public NotificationsController(
            GetMyNotificationsUseCase getMyNotifications, 
            MarkNotificationAsReadUseCase markNotificationAsRead)
        {
            _getMyNotifications = getMyNotifications;
            _markNotificationAsRead = markNotificationAsRead;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications([FromQuery] bool onlyUnread = false)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var notifications = await _getMyNotifications.ExecuteAsync(userId, onlyUnread);
            return Ok(notifications);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            await _markNotificationAsRead.ExecuteAsync(id, userId);
            return Ok(new { message = "Notificación marcada como leída exitosamente." });
        }
    }
}
