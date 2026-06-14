using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Runtime;
using SharingService.Data;
using SharingService.Services;

namespace SharingService
{
    internal static class Program
    {
        private static void Main()
        {
            var services = new ServiceCollection();
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    "Server=localhost\\SQLEXPRESS;Database=TravelPlannerDB;User Id=travelplanner;Password=Travel123!;TrustServerCertificate=True",
                    sqlOptions => sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null)));

            var serviceProvider = services.BuildServiceProvider();

            ServiceRuntime.RegisterServiceAsync("SharingServiceType",
                context => new SharingService(context, serviceProvider))
                .GetAwaiter().GetResult();

            Thread.Sleep(Timeout.Infinite);
        }
    }
}