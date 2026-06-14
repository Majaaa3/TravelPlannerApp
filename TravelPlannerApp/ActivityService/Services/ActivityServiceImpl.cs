using Microsoft.EntityFrameworkCore;
using ActivityService.Data;
using ActivityService.DTOs;
using ActivityService.Models;

namespace ActivityService.Services
{
    public class ActivityServiceImpl : IActivityService
    {
        private readonly AppDbContext _context;

        public ActivityServiceImpl(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ActivityDto>> GetActivitiesByTrip(int tripId)
        {
            return await _context.Activities
                .Where(a => a.TripId == tripId)
                .Select(a => MapToDto(a))
                .ToListAsync();
        }

        public async Task<ActivityDto> GetActivity(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null)
                throw new Exception("Activity not found.");
            return MapToDto(activity);
        }

        public async Task<ActivityDto> CreateActivity(CreateActivityDto dto)
        {
            if (dto.EstimatedCost < 0)
                throw new Exception("Estimated cost cannot be negative.");

            var activity = new Activity
            {
                Name = dto.Name,
                Date = dto.Date,
                Time = dto.Time,
                Location = dto.Location,
                Description = dto.Description,
                EstimatedCost = dto.EstimatedCost,
                Status = dto.Status,
                TripId = dto.TripId
            };

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            if (dto.EstimatedCost > 0)
            {
                var expense = new Expense
                {
                    Name = $"Activity: {dto.Name}",
                    Category = "Activity",
                    Amount = dto.EstimatedCost,
                    Date = dto.Date,
                    Description = $"Auto-generated from activity: {dto.Name}",
                    TripId = dto.TripId
                };
                _context.Expenses.Add(expense);
                await _context.SaveChangesAsync();
            }

            return MapToDto(activity);
        }

        public async Task<ActivityDto> UpdateActivity(int id, CreateActivityDto dto)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null)
                throw new Exception("Activity not found.");

            if (dto.EstimatedCost < 0)
                throw new Exception("Estimated cost cannot be negative.");

            var relatedExpense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.Name == $"Activity: {activity.Name}"
                    && e.TripId == activity.TripId);

            activity.Name = dto.Name;
            activity.Date = dto.Date;
            activity.Time = dto.Time;
            activity.Location = dto.Location;
            activity.Description = dto.Description;
            activity.EstimatedCost = dto.EstimatedCost;
            activity.Status = dto.Status;

            if (relatedExpense != null)
            {
                relatedExpense.Name = $"Activity: {dto.Name}";
                relatedExpense.Amount = dto.EstimatedCost;
                relatedExpense.Date = dto.Date;
            }

            await _context.SaveChangesAsync();
            return MapToDto(activity);
        }

        public async Task DeleteActivity(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null)
                throw new Exception("Activity not found.");

            var relatedExpense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.Name == $"Activity: {activity.Name}"
                    && e.TripId == activity.TripId);

            if (relatedExpense != null)
                _context.Expenses.Remove(relatedExpense);

            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ExpenseDto>> GetExpensesByTrip(int tripId)
        {
            return await _context.Expenses
                .Where(e => e.TripId == tripId)
                .Select(e => MapExpenseToDto(e))
                .ToListAsync();
        }

        public async Task<ExpenseDto> CreateExpense(CreateExpenseDto dto)
        {
            if (dto.Amount < 0)
                throw new Exception("Amount cannot be negative.");

            var expense = new Expense
            {
                Name = dto.Name,
                Category = dto.Category,
                Amount = dto.Amount,
                Date = dto.Date,
                Description = dto.Description,
                TripId = dto.TripId
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            return MapExpenseToDto(expense);
        }

        public async Task DeleteExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
                throw new Exception("Expense not found.");
            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ChecklistItemDto>> GetChecklistByTrip(int tripId)
        {
            return await _context.ChecklistItems
                .Where(c => c.TripId == tripId)
                .Select(c => MapChecklistToDto(c))
                .ToListAsync();
        }

        public async Task<ChecklistItemDto> CreateChecklistItem(CreateChecklistItemDto dto)
        {
            var item = new ChecklistItem
            {
                Name = dto.Name,
                TripId = dto.TripId
            };

            _context.ChecklistItems.Add(item);
            await _context.SaveChangesAsync();
            return MapChecklistToDto(item);
        }

        public async Task<ChecklistItemDto> ToggleChecklistItem(int id)
        {
            var item = await _context.ChecklistItems.FindAsync(id);
            if (item == null)
                throw new Exception("Checklist item not found.");

            item.IsCompleted = !item.IsCompleted;
            await _context.SaveChangesAsync();
            return MapChecklistToDto(item);
        }

        public async Task DeleteChecklistItem(int id)
        {
            var item = await _context.ChecklistItems.FindAsync(id);
            if (item == null)
                throw new Exception("Checklist item not found.");
            _context.ChecklistItems.Remove(item);
            await _context.SaveChangesAsync();
        }

        private static ActivityDto MapToDto(Activity a) => new ActivityDto
        {
            Id = a.Id,
            Name = a.Name,
            Date = a.Date,
            Time = a.Time,
            Location = a.Location,
            Description = a.Description,
            EstimatedCost = a.EstimatedCost,
            Status = a.Status,
            TripId = a.TripId
        };

        private static ExpenseDto MapExpenseToDto(Expense e) => new ExpenseDto
        {
            Id = e.Id,
            Name = e.Name,
            Category = e.Category,
            Amount = e.Amount,
            Date = e.Date,
            Description = e.Description,
            TripId = e.TripId
        };

        private static ChecklistItemDto MapChecklistToDto(ChecklistItem c) => new ChecklistItemDto
        {
            Id = c.Id,
            Name = c.Name,
            IsCompleted = c.IsCompleted,
            TripId = c.TripId
        };
    }
}