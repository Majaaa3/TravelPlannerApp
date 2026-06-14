using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Runtime;
using TripService.Data;
using TripService.Services;

namespace TripService
{
    internal static class Program
    {
        private static void Main()
        {
            var services = new ServiceCollection();

            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection"),
                    sqlOptions => sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null)));

            services.AddScoped<ITripService, TripServiceImpl>();
            services.AddScoped<IDestinationService, DestinationServiceImpl>();

            var serviceProvider = services.BuildServiceProvider();

            ServiceRuntime.RegisterServiceAsync("TripServiceType",
                context => new TripService(context, serviceProvider))
                .GetAwaiter().GetResult();

            Thread.Sleep(Timeout.Infinite);
        }
    }
}