using SharingService.DTOs;

namespace SharingService.Services
{
    public interface ISharingService
    {
        Task<ShareTokenDto> CreateShareToken(CreateShareTokenDto dto);
        Task<ShareTokenDto> ValidateToken(string token);
        Task RevokeToken(string token);
        Task<List<ShareTokenDto>> GetTokensByTrip(int tripId);
    }
}