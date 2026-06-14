using Microsoft.AspNetCore.Mvc;
using ActivityService.DTOs;
using ActivityService.Services;

namespace ActivityService.Controllers
{
    [ApiController]
    [Route("api/expenses")]
    public class ExpensesController : ControllerBase
    {
        private readonly IActivityService _activityService;

        public ExpensesController(IActivityService activityService)
        {
            _activityService = activityService;
        }

        [HttpGet("trip/{tripId}")]
        public async Task<IActionResult> GetExpensesByTrip(int tripId)
        {
            try
            {
                var expenses = await _activityService.GetExpensesByTrip(tripId);
                return Ok(expenses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateExpense([FromBody] CreateExpenseDto dto)
        {
            try
            {
                var expense = await _activityService.CreateExpense(dto);
                return Ok(expense);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            try
            {
                await _activityService.DeleteExpense(id);
                return Ok(new { message = "Expense deleted successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}