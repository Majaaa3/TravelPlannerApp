using System.Fabric;
using System.Runtime.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using TravelPlanner.Shared.Interfaces;
using TravelPlanner.Shared.Models;
using SharingService.Data;
using SharingService.Services;

namespace SharingService
{
    internal sealed class SharingService : StatefulService,
        IShareTokenNotifier,
        ISharingServiceCache,
        IEventPublisher
    {
        private readonly IServiceProvider _serviceProvider;
        private const string TokenCacheName = "activeTokens";
        private const string EventQueueName = "eventQueue";

        public SharingService(StatefulServiceContext context, IServiceProvider serviceProvider)
            : base(context)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task PublishAsync(AuditEvent ev)
        {
            var queue = await StateManager
                .GetOrAddAsync<IReliableQueue<AuditEvent>>(EventQueueName);

            using var tx = StateManager.CreateTransaction();
            await queue.EnqueueAsync(tx, ev);
            await tx.CommitAsync();
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            var tokenCache = await StateManager
                .GetOrAddAsync<IReliableDictionary<string, string>>(TokenCacheName);

            var queue = await StateManager
                .GetOrAddAsync<IReliableQueue<AuditEvent>>(EventQueueName);

            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var activeTokens = await db.ShareTokens
                .Where(t => t.IsActive && t.ExpiresAt > DateTime.UtcNow)
                .ToListAsync(cancellationToken);

            using (var tx = StateManager.CreateTransaction())
            {
                foreach (var token in activeTokens)
                {
                    await tokenCache.AddOrUpdateAsync(
                        tx,
                        token.Token,
                        token.AccessType,
                        (k, v) => token.AccessType);
                }
                await tx.CommitAsync();
            }

            while (!cancellationToken.IsCancellationRequested)
            {
                cancellationToken.ThrowIfCancellationRequested();

                using var tx = StateManager.CreateTransaction();
                var result = await queue.TryDequeueAsync(tx);

                if (result.HasValue)
                {
                    var auditEvent = result.Value;
                    ServiceEventSource.Current.Message(
                        $"[AUDIT] {auditEvent.Timestamp} | {auditEvent.ServiceSource} | {auditEvent.Message}");
                    await tx.CommitAsync();
                }
                else
                {
                    await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
                }
            }
        }

        public async Task AddTokenToCache(string token, string accessType)
        {
            var tokenCache = await StateManager
                .GetOrAddAsync<IReliableDictionary<string, string>>(TokenCacheName);

            using var tx = StateManager.CreateTransaction();
            await tokenCache.AddOrUpdateAsync(
                tx, token, accessType, (k, v) => accessType);
            await tx.CommitAsync();
        }

        public async Task<string> GetTokenFromCache(string token)
        {
            var tokenCache = await StateManager
                .GetOrAddAsync<IReliableDictionary<string, string>>(TokenCacheName);

            using var tx = StateManager.CreateTransaction();
            var result = await tokenCache.TryGetValueAsync(tx, token);
            return result.HasValue ? result.Value : null;
        }

        public async Task RemoveTokenFromCache(string token)
        {
            var tokenCache = await StateManager
                .GetOrAddAsync<IReliableDictionary<string, string>>(TokenCacheName);

            using var tx = StateManager.CreateTransaction();
            await tokenCache.TryRemoveAsync(tx, token);
            await tx.CommitAsync();
        }

        public async Task DeleteTokensByTrip(int tripId)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var tokens = await db.ShareTokens
                .Where(t => t.TripId == tripId)
                .ToListAsync();

            foreach (var token in tokens)
            {
                await RemoveTokenFromCache(token.Token);
            }

            db.ShareTokens.RemoveRange(tokens);
            await db.SaveChangesAsync();
        }

        public async Task<bool> ValidateEditToken(string token)
        {
            try
            {
                var tokenCache = await StateManager
                    .GetOrAddAsync<IReliableDictionary<string, string>>(TokenCacheName);

                using var tx = StateManager.CreateTransaction();
                var result = await tokenCache.TryGetValueAsync(tx, token);

                if (result.HasValue)
                {
                    return result.Value == "EDIT";
                }

                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var shareToken = await db.ShareTokens
                    .FirstOrDefaultAsync(t => t.Token == token
                        && t.IsActive
                        && t.ExpiresAt > DateTime.UtcNow);

                if (shareToken == null) return false;
                return shareToken.AccessType == "EDIT";
            }
            catch (Exception ex)
            {
                ServiceEventSource.Current.Message($"[ERROR] ValidateEditToken: {ex.Message}");
                return false;
            }
        }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            var listeners = new List<ServiceReplicaListener>();

            listeners.AddRange(this.CreateServiceRemotingReplicaListeners());

            listeners.Add(new ServiceReplicaListener(serviceContext =>
                new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
                {
                    var builder = WebApplication.CreateBuilder();

                    builder.Configuration
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

                    builder.Services.AddSingleton<StatefulServiceContext>(serviceContext);
                    builder.Services.AddSingleton<ISharingServiceCache>(this);

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

                    builder.Services.AddScoped<ISharingService, SharingServiceImpl>();

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