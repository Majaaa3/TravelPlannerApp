using Microsoft.AspNetCore.Mvc;
using SharingService.DTOs;
using SharingService.Services;

namespace SharingService.Controllers
{
    [ApiController]
    [Route("api/sharing")]
    public class SharingController : ControllerBase
    {
        private readonly ISharingService _sharingService;

        public SharingController(ISharingService sharingService)
        {
            _sharingService = sharingService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateShareToken([FromBody] CreateShareTokenDto dto)
        {
            try
            {
                var token = await _sharingService.CreateShareToken(dto);
                return Ok(token);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("validate/{token}")]
        public async Task<IActionResult> ValidateToken(string token)
        {
            try
            {
                var result = await _sharingService.ValidateToken(token);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("revoke/{token}")]
        public async Task<IActionResult> RevokeToken(string token)
        {
            try
            {
                await _sharingService.RevokeToken(token);
                return Ok(new { message = "Token revoked successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("trip/{tripId}")]
        public async Task<IActionResult> GetTokensByTrip(int tripId)
        {
            try
            {
                var tokens = await _sharingService.GetTokensByTrip(tripId);
                return Ok(tokens);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}