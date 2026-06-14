using Microsoft.AspNetCore.Mvc;
using ActivityService.DTOs;
using ActivityService.Services;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared.Interfaces;

namespace ActivityService.Controllers
{
    [ApiController]
    [Route("api/activities")]
    public class ActivitiesController : ControllerBase
    {
        private readonly IActivityService _activityService;

        public ActivitiesController(IActivityService activityService)
        {
            _activityService = activityService;
        }

        [HttpGet("trip/{tripId}")]
        public async Task<IActionResult> GetActivitiesByTrip(int tripId)
        {
            try
            {
                var activities = await _activityService.GetActivitiesByTrip(tripId);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetActivity(int id)
        {
            try
            {
                var activity = await _activityService.GetActivity(id);
                return Ok(activity);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateActivity([FromBody] CreateActivityDto dto)
        {
            try
            {
                var activity = await _activityService.CreateActivity(dto);
                return Ok(activity);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateActivity(int id, [FromBody] CreateActivityDto dto)
        {
            try
            {
                var shareToken = Request.Headers["X-Share-Token"].ToString().Trim();
                if (!string.IsNullOrEmpty(shareToken) && shareToken != "undefined" && shareToken != "null")
                {
                    var sharingProxy = ServiceProxy.Create<IShareTokenNotifier>(
                        new Uri("fabric:/TravelPlannerApp/SharingService"),
                        new ServicePartitionKey(0));

                    var isEditAllowed = await sharingProxy.ValidateEditToken(shareToken);
                    if (!isEditAllowed)
                        return StatusCode(403, new { message = "You have view-only access." });
                }

                var activity = await _activityService.UpdateActivity(id, dto);
                return Ok(activity);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(int id)
        {
            try
            {
                await _activityService.DeleteActivity(id);
                return Ok(new { message = "Activity deleted successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}