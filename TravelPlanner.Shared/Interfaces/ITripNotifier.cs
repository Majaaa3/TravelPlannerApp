using Microsoft.ServiceFabric.Services.Remoting;

namespace TravelPlanner.Shared.Interfaces
{
    public interface ITripNotifier : IService
    {
        Task DeleteTripsByUser(int userId);
    }
}