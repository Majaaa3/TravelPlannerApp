using Microsoft.AspNetCore.Mvc;
using ActivityService.DTOs;
using ActivityService.Services;

namespace ActivityService.Controllers
{
    [ApiController]
    [Route("api/checklist")]
    public class ChecklistController : ControllerBase
    {
        private readonly IActivityService _activityService;

        public ChecklistController(IActivityService activityService)
        {
            _activityService = activityService;
        }

        [HttpGet("trip/{tripId}")]
        public async Task<IActionResult> GetChecklistByTrip(int tripId)
        {
            try
            {
                var items = await _activityService.GetChecklistByTrip(tripId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateChecklistItem([FromBody] CreateChecklistItemDto dto)
        {
            try
            {
                var item = await _activityService.CreateChecklistItem(dto);
                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/toggle")]
        public async Task<IActionResult> ToggleChecklistItem(int id)
        {
            try
            {
                var item = await _activityService.ToggleChecklistItem(id);
                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChecklistItem(int id)
        {
            try
            {
                await _activityService.DeleteChecklistItem(id);
                return Ok(new { message = "Checklist item deleted successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}