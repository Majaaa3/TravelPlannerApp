using Microsoft.ServiceFabric.Services.Remoting;

namespace TravelPlanner.Shared.Interfaces
{
    public interface IActivityNotifier : IService
    {
        Task DeleteActivitiesByTrip(int tripId);
        Task DeleteExpensesByTrip(int tripId);
        Task DeleteChecklistByTrip(int tripId);
    }
}