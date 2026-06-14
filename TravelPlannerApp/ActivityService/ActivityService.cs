using System.Fabric;
using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using TravelPlanner.Shared.Interfaces;
using ActivityService.Data;
using ActivityService.Services;

namespace ActivityService
{
    internal sealed class ActivityService : StatelessService, IActivityNotifier
    {
        private readonly IServiceProvider _serviceProvider;

        public ActivityService(StatelessServiceContext context, IServiceProvider serviceProvider)
            : base(context)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task DeleteActivitiesByTrip(int tripId)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var activities = await db.Activities
                .Where(a => a.TripId == tripId)
                .ToListAsync();
            db.Activities.RemoveRange(activities);
            await db.SaveChangesAsync();
        }

        public async Task DeleteExpensesByTrip(int tripId)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var expenses = await db.Expenses
                .Where(e => e.TripId == tripId)
                .ToListAsync();
            db.Expenses.RemoveRange(expenses);
            await db.SaveChangesAsync();
        }

        public async Task DeleteChecklistByTrip(int tripId)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var items = await db.ChecklistItems
                .Where(c => c.TripId == tripId)
                .ToListAsync();
            db.ChecklistItems.RemoveRange(items);
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

                    builder.Services.AddScoped<IActivityService, ActivityServiceImpl>();

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