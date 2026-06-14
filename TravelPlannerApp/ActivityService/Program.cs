using Microsoft.ServiceFabric.Services.Runtime;

namespace ActivityService
{
    internal static class Program
    {
        private static void Main()
        {
            ServiceRuntime.RegisterServiceAsync("ActivityServiceType",
                context => new ActivityService(context,
                    new ServiceCollection()
                        .BuildServiceProvider()))
                .GetAwaiter().GetResult();

            Thread.Sleep(Timeout.Infinite);
        }
    }
}