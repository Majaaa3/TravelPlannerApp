namespace SharingService.Services
{
    public interface ISharingServiceCache
    {
        Task AddTokenToCache(string token, string accessType);
        Task<string> GetTokenFromCache(string token);
        Task RemoveTokenFromCache(string token);
    }
}