using TripService.DTOs;

namespace TripService.Services
{
    public interface IDestinationService
    {
        Task<List<DestinationDto>> GetDestinationsByTrip(int tripId);
        Task<DestinationDto> GetDestination(int id);
        Task<DestinationDto> CreateDestination(CreateDestinationDto dto);
        Task<DestinationDto> UpdateDestination(int id, CreateDestinationDto dto);
        Task DeleteDestination(int id);
    }
}