using Microsoft.EntityFrameworkCore;
using SharingService.Models;

namespace SharingService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<ShareToken> ShareTokens { get; set; }
    }
}