using TripService.DTOs;

namespace TripService.Services
{
    public interface ITripService
    {
        Task<List<TripDto>> GetAllTrips(int userId);
        Task<TripDto> GetTrip(int id);
        Task<TripDto> CreateTrip(CreateTripDto dto);
        Task<TripDto> UpdateTrip(int id, CreateTripDto dto);
        Task DeleteTrip(int id);
        Task<List<TripDto>> GetAllTripsAdmin();
    }
}