using System.Fabric;
using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.ServiceFabric.Services.Client;
using TravelPlanner.Shared.Interfaces;
using TripService.Data;
using TripService.Services;

namespace TripService
{
    internal sealed class TripService : StatelessService, ITripNotifier
    {
        private readonly IServiceProvider _serviceProvider;

        public TripService(StatelessServiceContext context, IServiceProvider serviceProvider)
            : base(context)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task DeleteTripsByUser(int userId)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var trips = await db.Trips
                .Where(t => t.UserId == userId)
                .ToListAsync();

            foreach (var trip in trips)
            {
                var activityNotifier = ServiceProxy.Create<IActivityNotifier>(
                    new Uri("fabric:/TravelPlannerApp/ActivityService"));
                await activityNotifier.DeleteActivitiesByTrip(trip.Id);
                await activityNotifier.DeleteExpensesByTrip(trip.Id);
                await activityNotifier.DeleteChecklistByTrip(trip.Id);

                var shareTokenNotifier = ServiceProxy.Create<IShareTokenNotifier>(
                    new Uri("fabric:/TravelPlannerApp/SharingService"),
                    new ServicePartitionKey(0));
                await shareTokenNotifier.DeleteTokensByTrip(trip.Id);
            }

            db.Trips.RemoveRange(trips);
            await db.SaveChangesAsync();
        }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            var listeners = new List<ServiceInstanceListener>();

            listeners.AddRange(this.CreateServiceRemotingInstanceListeners());

            listeners.Add(new ServiceInstanceListener(serviceContext =>
                new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
                {
                    var builder = WebApplication.CreateBuilder();

                    builder.Configuration
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

                    builder.Services.AddSingleton<StatelessServiceContext>(serviceContext);

                    builder.WebHost
                        .UseKestrel()
                        .UseContentRoot(Directory.GetCurrentDirectory())
                        .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                        .UseUrls(url);

                    builder.Services.AddDbContext<AppDbContext>(options =>
                        options.UseSqlServer(
                            builder.Configuration.GetConnectionString("DefaultConnection"),
                            sqlOptions => sqlOptions.EnableRetryOnFailure(
                                maxRetryCount: 5,
                                maxRetryDelay: TimeSpan.FromSeconds(30),
                                errorNumbersToAdd: null)));

                    builder.Services.AddScoped<ITripService, TripServiceImpl>();
                    builder.Services.AddScoped<IDestinationService, DestinationServiceImpl>();

                    builder.Services.AddCors(options =>
                    {
                        options.AddPolicy("AllowFrontend", policy =>
                        {
                            policy.WithOrigins("http://localhost:5173")
                                  .AllowAnyHeader()
                                  .AllowAnyMethod();
                        });
                    });

                    builder.Services.AddControllers();
                    builder.Services.AddEndpointsApiExplorer();
                    builder.Services.AddSwaggerGen();

                    var app = builder.Build();

                    app.UseSwagger();
                    app.UseSwaggerUI();
                    app.UseCors("AllowFrontend");
                    app.UseAuthentication();
                    app.UseAuthorization();
                    app.MapControllers();

                    return app;
                }), "KestrelListener"));

            return listeners;
        }
    }
}