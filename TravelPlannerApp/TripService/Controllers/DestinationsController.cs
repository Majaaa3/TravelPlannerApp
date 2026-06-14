using Microsoft.AspNetCore.Mvc;
using TripService.DTOs;
using TripService.Services;

namespace TripService.Controllers
{
    [ApiController]
    [Route("api/destinations")]
    public class DestinationsController : ControllerBase
    {
        private readonly IDestinationService _destinationService;

        public DestinationsController(IDestinationService destinationService)
        {
            _destinationService = destinationService;
        }

        [HttpGet("trip/{tripId}")]
        public async Task<IActionResult> GetDestinationsByTrip(int tripId)
        {
            try
            {
                var destinations = await _destinationService.GetDestinationsByTrip(tripId);
                return Ok(destinations);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDestination(int id)
        {
            try
            {
                var destination = await _destinationService.GetDestination(id);
                return Ok(destination);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateDestination([FromBody] CreateDestinationDto dto)
        {
            try
            {
                var destination = await _destinationService.CreateDestination(dto);
                return Ok(destination);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDestination(int id, [FromBody] CreateDestinationDto dto)
        {
            try
            {
                var destination = await _destinationService.UpdateDestination(id, dto);
                return Ok(destination);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDestination(int id)
        {
            try
            {
                await _destinationService.DeleteDestination(id);
                return Ok(new { message = "Destination deleted successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}