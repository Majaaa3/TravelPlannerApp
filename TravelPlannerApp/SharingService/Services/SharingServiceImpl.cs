using Microsoft.EntityFrameworkCore;
using QRCoder;
using SharingService.Data;
using SharingService.DTOs;
using SharingService.Models;

namespace SharingService.Services
{
    public class SharingServiceImpl : ISharingService
    {
        private readonly AppDbContext _context;
        private readonly ISharingServiceCache _cache;

        public SharingServiceImpl(AppDbContext context, ISharingServiceCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<ShareTokenDto> CreateShareToken(CreateShareTokenDto dto)
        {
            if (dto.AccessType != "VIEW" && dto.AccessType != "EDIT")
                throw new Exception("Access type must be VIEW or EDIT.");

            var token = new ShareToken
            {
                Token = Guid.NewGuid().ToString(),
                TripId = dto.TripId,
                AccessType = dto.AccessType,
                ExpiresAt = DateTime.UtcNow.AddDays(dto.ExpiresInDays)
            };

            // Sačuvaj u SQL bazi
            _context.ShareTokens.Add(token);
            await _context.SaveChangesAsync();

            // Sačuvaj u Reliable Dictionary (memorija)
            await _cache.AddTokenToCache(token.Token, token.AccessType);

            return MapToDto(token);
        }

        public async Task<ShareTokenDto> ValidateToken(string token)
        {
            // Prvo provjeri u Reliable Dictionary
            var cachedAccessType = await _cache.GetTokenFromCache(token);

            if (cachedAccessType != null)
            {
                // Token je u memoriji — provjeri i u bazi za detalje
                var cachedToken = await _context.ShareTokens
                    .FirstOrDefaultAsync(t => t.Token == token);

                if (cachedToken == null || !cachedToken.IsActive ||
                    cachedToken.ExpiresAt < DateTime.UtcNow)
                    throw new Exception("Token is invalid or expired.");

                return MapToDto(cachedToken);
            }

            // Ako nije u memoriji, provjeri u SQL bazi
            var shareToken = await _context.ShareTokens
                .FirstOrDefaultAsync(t => t.Token == token);

            if (shareToken == null)
                throw new Exception("Token not found.");

            if (!shareToken.IsActive)
                throw new Exception("Token is not active.");

            if (shareToken.ExpiresAt < DateTime.UtcNow)
                throw new Exception("Token has expired.");

            return MapToDto(shareToken);
        }

        public async Task RevokeToken(string token)
        {
            var shareToken = await _context.ShareTokens
                .FirstOrDefaultAsync(t => t.Token == token);

            if (shareToken == null)
                throw new Exception("Token not found.");

            // Ukloni iz Reliable Dictionary
            await _cache.RemoveTokenFromCache(token);

            // Deaktiviraj u SQL bazi
            shareToken.IsActive = false;
            await _context.SaveChangesAsync();
        }

        public async Task<List<ShareTokenDto>> GetTokensByTrip(int tripId)
        {
            return await _context.ShareTokens
                .Where(t => t.TripId == tripId)
                .Select(t => MapToDto(t))
                .ToListAsync();
        }

        private static ShareTokenDto MapToDto(ShareToken token)
        {
            var qrCode = GenerateQrCode(token.Token);

            return new ShareTokenDto
            {
                Id = token.Id,
                Token = token.Token,
                TripId = token.TripId,
                AccessType = token.AccessType,
                CreatedAt = token.CreatedAt,
                ExpiresAt = token.ExpiresAt,
                IsActive = token.IsActive,
                QrCodeBase64 = qrCode
            };
        }

        private static string GenerateQrCode(string token)
        {
            var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(
                $"http://localhost:5173/shared/{token}",
                QRCodeGenerator.ECCLevel.Q);
            var qrCode = new Base64QRCode(qrCodeData);
            return qrCode.GetGraphic(20);
        }
    }
}