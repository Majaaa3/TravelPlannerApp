using ActivityService.DTOs;

namespace ActivityService.Services
{
    public interface IActivityService
    {
        Task<List<ActivityDto>> GetActivitiesByTrip(int tripId);
        Task<ActivityDto> GetActivity(int id);
        Task<ActivityDto> CreateActivity(CreateActivityDto dto);
        Task<ActivityDto> UpdateActivity(int id, CreateActivityDto dto);
        Task DeleteActivity(int id);
        Task<List<ExpenseDto>> GetExpensesByTrip(int tripId);
        Task<ExpenseDto> CreateExpense(CreateExpenseDto dto);
        Task DeleteExpense(int id);
        Task<List<ChecklistItemDto>> GetChecklistByTrip(int tripId);
        Task<ChecklistItemDto> CreateChecklistItem(CreateChecklistItemDto dto);
        Task<ChecklistItemDto> ToggleChecklistItem(int id);
        Task DeleteChecklistItem(int id);
    }
}