using Microsoft.ServiceFabric.Services.Runtime;

namespace UserService
{
    internal static class Program
    {
        private static void Main()
        {
            ServiceRuntime.RegisterServiceAsync("UserServiceType",
                context => new UserService(context)).GetAwaiter().GetResult();
            Thread.Sleep(Timeout.Infinite);
        }
    }
}