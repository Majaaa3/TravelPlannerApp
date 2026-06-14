using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared.Interfaces;
using TripService.Data;
using TripService.DTOs;
using TripService.Models;
using Microsoft.ServiceFabric.Services.Client;
using TravelPlanner.Shared.Models;

namespace TripService.Services
{
    public class TripServiceImpl : ITripService
    {
        private readonly AppDbContext _context;

        public TripServiceImpl(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TripDto>> GetAllTrips(int userId)
        {
            return await _context.Trips
                .Where(t => t.UserId == userId)
                .Include(t => t.Destinations)
                .Select(t => MapToDto(t))
                .ToListAsync();
        }

        public async Task<TripDto> GetTrip(int id)
        {
            var trip = await _context.Trips
                .Include(t => t.Destinations)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (trip == null)
                throw new Exception("Trip not found.");

            return MapToDto(trip);
        }

        public async Task<TripDto> CreateTrip(CreateTripDto dto)
        {
            if (dto.EndDate < dto.StartDate)
                throw new Exception("End date cannot be before start date.");

            if (dto.Budget < 0)
                throw new Exception("Budget cannot be negative.");

            var trip = new Trip
            {
                Name = dto.Name,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Budget = dto.Budget,
                Notes = dto.Notes,
                UserId = dto.UserId
            };

            _context.Trips.Add(trip);
            await _context.SaveChangesAsync();

            var eventPublisher = ServiceProxy.Create<IEventPublisher>(
                new Uri("fabric:/TravelPlannerApp/SharingService"),
                new ServicePartitionKey(0));

            await eventPublisher.PublishAsync(new AuditEvent
            {
                Message = $"Trip '{trip.Name}' created by user {trip.UserId}",
                Timestamp = DateTime.UtcNow,
                ServiceSource = "TripService"
            });

            return MapToDto(trip);
        }

        public async Task<TripDto> UpdateTrip(int id, CreateTripDto dto)
        {
            var trip = await _context.Trips
                .Include(t => t.Destinations)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (trip == null)
                throw new Exception("Trip not found.");

            if (dto.EndDate < dto.StartDate)
                throw new Exception("End date cannot be before start date.");

            if (dto.Budget < 0)
                throw new Exception("Budget cannot be negative.");

            trip.Name = dto.Name;
            trip.Description = dto.Description;
            trip.StartDate = dto.StartDate;
            trip.EndDate = dto.EndDate;
            trip.Budget = dto.Budget;
            trip.Notes = dto.Notes;

            await _context.SaveChangesAsync();

            return MapToDto(trip);
        }

        public async Task DeleteTrip(int id)
        {
            var trip = await _context.Trips.FindAsync(id);

            if (trip == null)
                throw new Exception("Trip not found.");

            var eventPublisher = ServiceProxy.Create<IEventPublisher>(
                new Uri("fabric:/TravelPlannerApp/SharingService"),
                new ServicePartitionKey(0));

            await eventPublisher.PublishAsync(new AuditEvent
            {
                Message = $"Trip '{trip.Name}' deleted by user {trip.UserId}",
                Timestamp = DateTime.UtcNow,
                ServiceSource = "TripService"
            });

            var activityNotifier = ServiceProxy.Create<IActivityNotifier>(
                new Uri("fabric:/TravelPlannerApp/ActivityService"));

            await activityNotifier.DeleteActivitiesByTrip(id);
            await activityNotifier.DeleteExpensesByTrip(id);
            await activityNotifier.DeleteChecklistByTrip(id);

            var shareTokenNotifier = ServiceProxy.Create<IShareTokenNotifier>(
                new Uri("fabric:/TravelPlannerApp/SharingService"),
                new ServicePartitionKey(0));

            await shareTokenNotifier.DeleteTokensByTrip(id);

            _context.Trips.Remove(trip);
            await _context.SaveChangesAsync();
        }

        public async Task<List<TripDto>> GetAllTripsAdmin()
        {
            return await _context.Trips
                .Include(t => t.Destinations)
                .Select(t => MapToDto(t))
                .ToListAsync();
        }

        private static TripDto MapToDto(Trip trip)
        {
            return new TripDto
            {
                Id = trip.Id,
                Name = trip.Name,
                Description = trip.Description,
                StartDate = trip.StartDate,
                EndDate = trip.EndDate,
                Budget = trip.Budget,
                Notes = trip.Notes,
                UserId = trip.UserId,
                CreatedAt = trip.CreatedAt,
                Destinations = trip.Destinations?
                    .Select(d => new DestinationDto
                    {
                        Id = d.Id,
                        Name = d.Name,
                        Location = d.Location,
                        ArrivalDate = d.ArrivalDate,
                        DepartureDate = d.DepartureDate,
                        Description = d.Description,
                        TripId = d.TripId
                    }).ToList()
            };
        }
    }
}