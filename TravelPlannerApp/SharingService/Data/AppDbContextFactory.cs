using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SharingService.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseSqlServer(
                "Server=localhost\\SQLEXPRESS;Database=SharingServiceDB;User Id=travelplanner;Password=Travel123!;TrustServerCertificate=True");

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}