using Microsoft.ServiceFabric.Services.Remoting;
using TravelPlanner.Shared.Models;

namespace TravelPlanner.Shared.Interfaces
{
    public interface IEventPublisher : IService
    {
        Task PublishAsync(AuditEvent ev);
    }
}