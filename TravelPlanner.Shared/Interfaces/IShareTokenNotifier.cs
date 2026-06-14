using Microsoft.ServiceFabric.Services.Remoting;

namespace TravelPlanner.Shared.Interfaces
{
    public interface IShareTokenNotifier : IService
    {
        Task DeleteTokensByTrip(int tripId);
        Task<bool> ValidateEditToken(string token);
    }
}